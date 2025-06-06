import { User } from "firebase/auth";
import { FaKey, FaBars, FaTimes } from "react-icons/fa";
import styles from './Compute.module.css';
import { auth } from "./firebase.config";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface UserInfo {
	user: User;
}

const Compute: React.FC<UserInfo> = ({ user }) => {
	const [showKey, setShowKey] = useState<boolean>(false);
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
	const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false);
	const [testMode, setTestMode] = useState<boolean>(false);
	const [billingDialogOpen, setBillingDialogOpen] = useState<boolean>(false);
	const navigate = useNavigate();

	// Sample billing data
	const billingData = [
		{ month: "January 2025", amount: "$29.99" },
		{ month: "December 2024", amount: "$35.50" },
		{ month: "November 2024", amount: "$42.75" },
		{ month: "October 2024", amount: "$28.00" },
		{ month: "September 2024", amount: "$31.25" }
	];

	const handleTestModeToggle = () => {
		setTestMode(!testMode);
	};

	const handleBillingClick = () => {
		if (!testMode) {
			setBillingDialogOpen(true);
		}
	};

	const closeBillingDialog = () => {
		setBillingDialogOpen(false);
	};

	// Logout handler function
	const handleLogout = async () => {
		try {
			await auth.signOut();
			navigate('/'); // Redirect to home page
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	return (
		<>
			<header className={styles.navbar}>
				<div className={styles.navbarContainer}>
					<div className={styles.logoArea}>
						{/* Left Sidebar Toggle Button */}
						<button 
							className={styles.leftSidebarBtn}
							onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
						>
							<FaBars />
						</button>
						
						<button 
							className={styles.hamburgerBtn}
							onClick={() => setSidebarOpen(!sidebarOpen)}
						>
							<FaBars />
						</button>
						<img className={styles.logo} src="/Aquesa_Logo.png" alt="aquesa-logo" />
						<span className={styles.brandName}>Aquesa Solutions</span>
					</div>
					<nav className={`${styles.navLinks} ${styles.desktopNav}`}>
						<div className={styles.testModeContainer}>
							<button 
								className={`${styles.navLinksBilling} ${testMode ? styles.disabled : ''}`}
								onClick={handleBillingClick}
								disabled={testMode}
							>
								Billing
							</button>
							<div className={styles.testModeWrapper}>
								<span className={styles.testModeLabel}>Test Mode</span>
								<button
									className={`${styles.testModeToggle} ${testMode ? styles.active : ''}`}
									onClick={handleTestModeToggle}
								>
									<span className={styles.toggleSlider}></span>
								</button>
							</div>
						</div>
						<a className={styles.navLinksDocs} href="https://github.com/aquesa-solutions/board/blob/main/developer-guide.md" target="_blank" rel="noopener noreferrer">
							Docs
						</a>
						<button className={styles.navLinksLogout} onClick={handleLogout}>
							<a href="/" style={{all:"unset"}}><a href="/" style={{ all: 'unset', cursor: 'pointer' }}>
							<svg
								height="20px"
								width="20px"
								version="1.1"
								id="Capa_1"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 30.143 30.143"
								fill="#ff0000"
								stroke="#ff0000"
							>
								<g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
								<g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
								<g id="SVGRepo_iconCarrier">
									<g>
										<path
											style={{ fill: '#ff0000' }}
											d="M20.034,2.357v3.824c3.482,1.798,5.869,5.427,5.869,9.619c0,5.98-4.848,10.83-10.828,10.83 
											c-5.982,0-10.832-4.85-10.832-10.83c0-3.844,2.012-7.215,5.029-9.136V2.689C4.245,4.918,0.731,9.945,0.731,15.801 
											c0,7.921,6.42,14.342,14.34,14.342c7.924,0,14.342-6.421,14.342-14.342C29.412,9.624,25.501,4.379,20.034,2.357z"
										></path>
										<path
											style={{ fill: '#ff0000' }}
											d="M14.795,17.652c1576,0,1.736-0.931,1.736-2.076V2.08c0-1.148-0.16-2.08-1.736-2.08 
											c-1.57,0-1.732,0.932-1.732,2.08v13.496C13.062,16.722,13.225,17.652,14.795,17.652z"
										></path>
									</g>
								</g>
							</svg>
							</a>
							</a> 
						</button>
					</nav>
				</div>
			</header>

			{/* Left Sidebar */}
			<div className={`${styles.leftSidebar} ${leftSidebarOpen ? styles.leftSidebarOpen : ''}`}>
				<div className={styles.leftSidebarHeader}>
					<span></span>
					<button 
						className={styles.leftSidebarCloseBtn}
						onClick={() => setLeftSidebarOpen(false)}
					>
						<FaTimes />
					</button>
				</div>
				<nav className={styles.leftSidebarNav}>
					<a className={styles.leftSidebarLink} href="#dashboard">
						Storage 
					</a>
					<a className={styles.leftSidebarLink} href="#files">
						Virtual Compute 
					</a>
					<a className={styles.leftSidebarLink} href="#folders">
						Services
					</a>
				</nav>
			</div>

			{/* Left Sidebar Overlay */}
			{leftSidebarOpen && <div className={styles.leftSidebarOverlay} onClick={() => setLeftSidebarOpen(false)}></div>}

			{/* Billing Dialog */}
			{billingDialogOpen && (
				<>
					<div className={styles.dialogOverlay} onClick={closeBillingDialog}></div>
					<div className={styles.billingDialog}>
						<div className={styles.dialogHeader}>
							<h2 className={styles.dialogTitle}>Bills</h2>
							<button 
								className={styles.dialogCloseBtn}
								onClick={closeBillingDialog}
							>
								<FaTimes />
							</button>
						</div>
						<hr className={styles.dialogDivider} />
						<div className={styles.dialogContent}>
							{billingData.map((bill, index) => (
								<div key={index} className={styles.billItem}>
									<span className={styles.billMonth}>{bill.month}</span>
									<hr className={styles.billDivider} />
									<span className={styles.billAmount}>{bill.amount} &nbsp; <a href="" style={{textDecoration:"none", color:"blue"}}>Download Invoice</a></span>
								</div>
							))}
						</div>
					</div>
				</>
			)}

			{/* Right Sidebar (Responsive) */}
			<div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
				<div className={styles.sidebarHeader}>
					<span>Menu</span>
					<button 
						className={styles.closeBtn}
						onClick={() => setSidebarOpen(false)}
					>
						<FaTimes />
					</button>
				</div>
				<nav className={styles.sidebarNav}>
					<div className={`${styles.testModeContainer} ${styles.sidebarTestMode}`}>
						<span className={styles.testModeLabel}>Test Mode</span>
						<button
							className={`${styles.testModeToggle} ${testMode ? styles.active : ''}`}
							onClick={handleTestModeToggle}
						>
							<span className={styles.toggleSlider}></span>
						</button>
					</div>
					<a className={styles.sidebarLink} href="https://github.com/aquesa-solutions/board/blob/main/developer-guide.md" target="_blank" rel="noopener noreferrer">
						Docs
					</a>
					<button 
						className={`${styles.sidebarBilling} ${testMode ? styles.disabled : ''}`}
						onClick={handleBillingClick}
						disabled={testMode}
					>
						Billing
					</button>
					<button className={styles.sidebarLogout} onClick={handleLogout}>
						Logout ⏻
					</button>
				</nav>
			</div>

			{/* Right Sidebar Overlay */}
			{sidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)}></div>}

			<div className={styles.mainContainer}>
				<div className={styles.contentWrapper}>
					{/* Storage Section */}
					<div className={styles.storageSection}>
						<div className={styles.storageHeader}>
							<h2>Virtual Compute </h2>
							<button 
								className={styles.newinstance}
								onClick={() => setShowKey(!showKey)}
							>
								+ New Instance 
							</button>
						</div>
						{showKey && (
							<div className={styles.keyDisplay}>
								<p className={styles.keyField}>{user.uid}</p>
								<button 
									className={styles.closeKeyBtn}
									onClick={() => setShowKey(false)}
								>
									<FaTimes />
								</button>
							</div>
						)}
						<p>All the files/folder stored will be deleted within 3 hours from the time <br />of creation when created in the test mode.</p>
					</div>
                    
				</div>
                
			</div>

            
		</>
	);
}

export default Compute;