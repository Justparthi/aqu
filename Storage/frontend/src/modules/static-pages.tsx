import { useState } from "react";
import ReactMarkdown from "react-markdown";

import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

import 'highlight.js/styles/github.css'
import 'github-markdown-css/github-markdown-light.css';
import './static-pages.css';

interface PageInfo {
  page: string;
}

const StaticPages: React.FC<PageInfo> = ({page}) => {
  const [markDown, setMarkDown] = useState<string>("");
  
  fetch(`/${page}`).then(async (response) => {
    if(response.ok)
      setMarkDown(await response.text())
    else setMarkDown("### Unable to load the page at this moment");
  }).catch((error) => {
    console.log(error);
    setMarkDown("### Unable to load the page at this moment")
  })

  return (
    <div className="container">
      <a href="/" style={{color: "black", textDecoration: "none",
              outline: "0", border: "none"}} >
        <div className="back-button">
          <img src="/Back_Icon.png" className="icon" />
          <span className="text">Previous</span>
        </div>
      </a>
      <div style={{width: "70%", margin: "auto", padding: "12px"}} className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}>
          {markDown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default StaticPages;