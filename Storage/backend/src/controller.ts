import { Request, Response } from 'express';
import { createClient } from 'redis';

import { User, Waitlist } from './models';
import env_config from './configurations';
import GCP_OPS from './gcp_ops';

/* Auth handler micro functions. */
const user_exists = async (uid_: string, onComplete: (exists: boolean, isError: boolean) => void) => {
  const uid = uid_.toLowerCase();

  try {
    const user = await User.findOne({ uid }).lean();
    if(user) onComplete(true, false);
    else onComplete(false, false);
  } catch(e) {
    console.log(e);
    onComplete(false, true);
  }
}

const check_limit = async (): Promise<boolean> => {
  let is_limit_reached: boolean = false;

  try {
    const client = await createClient({
      url: env_config.redis_conn_string
    }).on('error', (err: Error) => console.error(err))
    .connect();
    
    const limit = Number(await client.get("reg_limit")) || (await User.collection.countDocuments());
    
    client.destroy();
  
    is_limit_reached = (limit > 100);

  } catch(e) {
    console.log(e);
    try {
      is_limit_reached = (await User.collection.countDocuments()) > 100;
    } catch(e) {
      console.log(e);
      is_limit_reached = true;
    }

  } finally { return is_limit_reached; }
}

const increase_limit = async () => {
  try {

    const client = await createClient({
      url: env_config.redis_conn_string
    }).on('error', (err: Error) => console.error(err))
    .connect();
    await client.set("reg_limit",
      Number(await client.get("reg_limit")) + 1
      || await User.collection.countDocuments()
    );
    
    client.destroy();

  } catch(e) { }
}

const insert_key = async (uid_: string) => {
  const uid = uid_.toLowerCase();

  try {
    const client = await createClient({
      url: env_config.redis_conn_string
    }).on('error', (err: Error) => console.error(err))
    .connect();
  
    let valid_keys = await client.get("valid_keys");
    let modified_keys = valid_keys
      ? JSON.parse(valid_keys).concat([uid])
      : (await User.collection.find({}).toArray()).map(item => item["uid"]);
  
    await client.set("valid_keys", JSON.stringify(modified_keys));
    client.destroy();

  } catch(e) { console.log(e); }
}

const check_key_validity = async(uid_: string): Promise<boolean> => {
  let exists: boolean = false;
  const uid = uid_.toLowerCase();

  try {
    const client = await createClient({
      url: env_config.redis_conn_string
    }).on('error', (err: Error) => console.error(err))
    .connect();
  
    let valid_keys = await client.get("valid_keys");
    exists = valid_keys
      ? JSON.parse(valid_keys).includes(uid)
      : (await User.collection.find({}).toArray()).map(item => item["uid"]).includes(uid);
  
    client.destroy();
  
  } catch(e) {
    try {
      exists = (await User.collection.find({}).toArray()).map(item => item["uid"]).includes(uid);
    } catch(e) {
      exists = false;
    }
  } finally {
    return exists;
  }
}

const create_user = async (uid_: string, email: string,
  displayName: string, currency: string, onComplete: (isLimitReached: boolean, isError: boolean) => void) => {
    const uid = uid_.toLowerCase();
    try {
      const limit_reached = await check_limit();
      if(!limit_reached) {
        await new User({ uid, email, displayName, currency }).save();
        await increase_limit();
        await insert_key(uid);
        onComplete(false, false);
      } else {
        await new Waitlist({ uid, email }).save();
        onComplete(true, false);
      }
    } catch(e) {
      console.log(e);
      onComplete(false, true);
    }
}

const insert_blob = async (uid: string, url: string, onComplete: (isError: boolean) => void) => {
  try {
    await User.findOneAndUpdate({ uid:uid }, { $addToSet: { blobs: url } }, { new:true, upsert: true });
    onComplete(false);
  } catch(e) { onComplete(true); console.log(e); }
}

/* /prat/p */
const prat_p_handler = async (req: Request, res: Response) => {
  console.log(`${Date.now()} POST <key>.storage-api.cloud.aquesa-solutions.com/p ${req.ip}`);

  if(!req.params || !req.params.uid ||
      !req.body || !req.body.file_name || !req.file) {
    res.status(404).send({error :
      !req.params
        ? "Missing parameters" : !req.params.uid
          ? "Missing key" : !req.body
            ? "Missing request body" : !req.body.file_name
              ? "Missing file name" : "Missing file contents"});
    res.end();

    return;
  }

  const { uid } = req.params;
  const { file_name } = req.body;

  if(!(await check_key_validity(uid))) {
    res.status(400).send({error: `Invalid key (${uid})`});
    res.end();

    return;
  }

  GCP_OPS.place(uid, req.file, file_name, (isError, url_or_error) => {
    if(isError) {
      console.log(url_or_error);
      res.status(400).send({error: "Place operation failed, please try again later"});
      res.end();

      return;

    }

    insert_blob(uid, url_or_error, (isError) => {
      if(isError) {
        console.log("blob insertion failed")
      }
    });

    res.status(200).send({success: "File uploaded successfully"});
    res.end();

    return;

  });
}

/* /prat/r */
const prat_r_handler = async (req: Request, res: Response) => {
  console.log(`${Date.now()} POST <key>.storage-api.cloud.aquesa-solutions.com/r ${req.ip}`);

  if(!req.params || !req.params.uid ||
     !req.body || !req.body.file_name) {
    res.status(404).send({error :
        ! req.params
          ? "Missing parameters" : !req.params.uid
            ? "Missing or invalid key": !req.body
              ? "Missing request body" :"Missing file name"
    });
    res.end();

    return;
  }

  const { uid } = req.params;
  const { file_name } = req.body;

  if(!(await check_key_validity(uid))) {
    res.status(400).send({error: `Invalid key (${uid})`});
    res.end();

    return;
  }

  GCP_OPS.retrieve(uid, file_name, (isError, file) => {
    if(isError) {
      
      res.status(400).send({error: "File retrieval unsuccesful, might be deleted."});
      res.end();

      return;
    }

    res.status(200).send({file_name: file_name, contents: file});
  })
  
}

/* /prat/t */
const prat_t_handler = async (req: Request, res: Response) => {
  console.log(`${Date.now()} POST <key>.storage-api.cloud.aquesa-solutions.com/t ${req.ip}`);

  if(!req.params || !req.params.uid ||
     !req.body || !req.body.file_name) {
      res.status(404).send({error :
        ! req.params
          ? "Missing parameters" : !req.params.uid
            ? "Missing or invalid key": !req.body
              ? "Missing request body" :"Missing file name"
    });
    res.end();

    return;
  }

  const { uid } = req.params;
  const { file_name } = req.body;

  if(!(await check_key_validity(uid))) {
    res.status(400).send({error: `Invalid key (${uid})`});
    res.end();

    return;
  }

  GCP_OPS.truncate(uid, file_name, (isError) => {
    if(isError) {
      res.status(400).send({error: "File deletion unsuccessful, might have been already deleted."});
      res.end();

      return;
    }

    res.status(200).send({success: "File deleted successfully."});
  })
}

/* /api/auth */
const auth_handler = async (req: Request, res: Response) => {
  console.log(`${Date.now()} POST /api/auth/ ${req.ip}`);

  const { uid, email, displayName, currency } = req.body;

  if(!uid || !email || !displayName || !currency) {
    res.status(500).send("Missing param(s), request body should contain uid, email, displayName and currency.");
    return;
  }

  await user_exists(uid, async (exists, isError) => {
    if(isError) {
      res.status(500).send("Internal Server Error");
      return;
    }

    if(exists) {
      res.status(200).send("User authenticated successfully");
      return;
    } else {
      await create_user(uid, email, displayName, currency, async (isLimitReached, isError) => {
        if(isError) {
          res.status(500).send("Internal Server Error.");
          return;
        } else {
          if(!isLimitReached) {
            res.status(201).send("User created and authenticated successfully");
            return;
          } else {
            res.status(202).send("Registrations limit reached. Your are now in the waitlist successfully.");
            return;
          }
        }
      });
    }
  })
}

/* /api */
const home_handler = (req: Request, res: Response) => {
  res.status(200).send("<h1>Hello,world!</h1>");
}

/* /admin/aquesa/ */
const admin_handler = async (req: Request, res: Response) => {
  if(!req.params.passKey) {
    res.status(403).send("<h1>403 Forbidden</h1>");
    return;
  }

  const {passKey} = req.params;

  if(passKey !== "2fcac19e4109fdec") {
    res.status(403).send("<h1>403 Forbidden</h1>");
    return;
  }

  let users: string = "";

  try {
    let usersArray = await User.collection.find({}).toArray();
    let index = 0;
    usersArray.forEach(user => {
      users += (index + 1) + ") Email: " + user["email"] + ", name: "
        + user["displayName"] + ", currency: " + user["currency"];
      users += "\n";
      index += 1;
    })

    res.status(200).send(users);
  } catch(e) {}
}

export {
  prat_p_handler,
  prat_r_handler,
  prat_t_handler,
  home_handler,
  auth_handler,
  admin_handler
};