import { useState } from "react";
import "./landing.css";
import { 
	Auth, 
	GoogleAuthProvider, 
	signInWithPopup, 
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	updateProfile,
	User
} from "firebase/auth";

import logo from "../../public/Aquesa_Logo.png"

interface AuthProps {
	auth: Auth,
	provider: GoogleAuthProvider,
	setCurrency: React.Dispatch<React.SetStateAction<string>>,
	setIsCurrencyModified: React.Dispatch<React.SetStateAction<boolean>>
}

interface SEOHeadProps {
	title: string;
	description: string;
	keywords: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({ title, description, keywords }) => {
	return null; // In a real app, this would set document head
};

interface AuthPopupProps {
	isOpen: boolean;
	onClose: () => void;
	auth: Auth;
	provider: GoogleAuthProvider;
	onAuthSuccess?: (user: User) => void;
}

const AuthPopup: React.FC<AuthPopupProps> = ({ isOpen, onClose, auth, provider, onAuthSuccess }) => {
	const [isSignUp, setIsSignUp] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: ""
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
		// Clear error when user starts typing
		if (error) setError("");
	};

	const validateForm = (): boolean => {
		if (!formData.email || !formData.password) {
			setError("Email and password are required");
			return false;
		}
		
		if (isSignUp && !formData.name) {
			setError("Name is required for sign up");
			return false;
		}

		if (formData.password.length < 6) {
			setError("Password must be at least 6 characters long");
			return false;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			setError("Please enter a valid email address");
			return false;
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!validateForm()) return;

		setIsLoading(true);
		setError("");

		try {
			let userCredential;
			
			if (isSignUp) {
				// Create new user
				userCredential = await createUserWithEmailAndPassword(
					auth, 
					formData.email, 
					formData.password
				);
				
				// Update the user's display name
				if (userCredential.user && formData.name) {
					await updateProfile(userCredential.user, {
						displayName: formData.name
					});
				}
			} else {
				// Sign in existing user
				userCredential = await signInWithEmailAndPassword(
					auth, 
					formData.email, 
					formData.password
				);
			}

			// Success callback
			if (onAuthSuccess && userCredential.user) {
				onAuthSuccess(userCredential.user);
			}

			// Reset form and close popup
			setFormData({ name: "", email: "", password: "" });
			onClose();
			
		} catch (error: any) {
			console.error("Authentication error:", error);
			
			// Handle specific Firebase auth errors
			switch (error.code) {
				case 'auth/email-already-in-use':
					setError("An account with this email already exists");
					break;
				case 'auth/weak-password':
					setError("Password is too weak");
					break;
				case 'auth/user-not-found':
					setError("No account found with this email");
					break;
				case 'auth/wrong-password':
					setError("Incorrect password");
					break;
				case 'auth/invalid-email':
					setError("Invalid email address");
					break;
				case 'auth/user-disabled':
					setError("This account has been disabled");
					break;
				case 'auth/too-many-requests':
					setError("Too many failed attempts. Please try again later");
					break;
				default:
					setError("Authentication failed. Please try again");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		setError("");

		try {
			const result = await signInWithPopup(auth, provider);
			
			// Success callback
			if (onAuthSuccess && result.user) {
				onAuthSuccess(result.user);
			}

			onClose();
		} catch (error: any) {
			console.error("Google sign-in error:", error);
			
			switch (error.code) {
				case 'auth/popup-closed-by-user':
					setError("Sign-in was cancelled");
					break;
				case 'auth/popup-blocked':
					setError("Popup was blocked by your browser");
					break;
				case 'auth/account-exists-with-different-credential':
					setError("An account already exists with the same email");
					break;
				default:
					setError("Google sign-in failed. Please try again");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({ name: "", email: "", password: "" });
		setError("");
		setIsLoading(false);
	};

	const handleTabSwitch = (signUp: boolean) => {
		setIsSignUp(signUp);
		resetForm();
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="auth-overlay">
			<div className="auth-popup">
				{/* Close button */}
				<button
					onClick={handleClose}
					className="auth-close-btn"
					disabled={isLoading}
				>
					×
				</button>

				{/* Toggle between Sign Up and Sign In */}
				<div className="auth-tabs">
					<button
						onClick={() => handleTabSwitch(true)}
						className={`auth-tab ${isSignUp ? 'active' : ''}`}
						disabled={isLoading}
					>
						Sign Up
					</button>
					<button
						onClick={() => handleTabSwitch(false)}
						className={`auth-tab ${!isSignUp ? 'active' : ''}`}
						disabled={isLoading}
					>
						Sign In
					</button>
				</div>

				{/* Error Message */}
				{error && (
					<div className="auth-error">
						{error}
					</div>
				)}

				{/* Form Container */}
				<div className="auth-form-container">
					{/* Form */}
					<form onSubmit={handleSubmit} className="auth-form">
						{isSignUp && (
							<div className="auth-field">
								<label htmlFor="name" className="auth-label">
									Full Name <span style={{color:"red"}}>*</span>
								</label>
								<input
									type="text"
									id="name"
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									className="auth-input"
									disabled={isLoading}
									required
								/>
							</div>
						)}

						<div className="auth-field">
							<label htmlFor="email" className="auth-label">
								Email <span style={{color:"red"}}>*</span>
							</label>
							<input
								type="email"
								id="email"
								name="email"
								value={formData.email}
								onChange={handleInputChange}
								className="auth-input"
								disabled={isLoading}
								required
							/>
						</div>

						<div className="auth-field">
							<label htmlFor="password" className="auth-label">
								Password <span style={{color:"red"}}>*</span>
							</label>
							<input
								type="password"
								id="password"
								name="password"
								value={formData.password}
								onChange={handleInputChange}
								className="auth-input"
								disabled={isLoading}
								minLength={6}
								required
							/>
						</div>

						<button
							type="submit"
							className="auth-submit-btn"
							disabled={isLoading}
						>
							{isLoading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
						</button>
					</form>

					{/* Divider */}
					<div className="auth-divider">
						<div className="auth-divider-line"></div>
						<span className="auth-divider-text">or</span>
						<div className="auth-divider-line"></div>
					</div>

					{/* Google Sign In */}
					<button
						onClick={handleGoogleSignIn}
						className="auth-google-btn"
						disabled={isLoading}
					>
						<svg width="18" height="18" viewBox="0 0 24 24">
							<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
							<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
							<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
							<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
						</svg>
						{isLoading ? 'Please wait...' : 'Continue with Google'}
					</button>
				</div>
			</div>

			<style jsx>{`
				.auth-overlay {
					position: fixed;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background-color: rgba(0, 0, 0, 0.5);
					display: flex;
					align-items: center;
					justify-content: center;
					z-index: 1000;
					backdrop-filter: blur(2px);
				}

				.auth-popup {
					background-color: white;
					border-radius: 60px;
					padding: 2rem;
					width: 700px;
					height: 600px;
					position: relative;
					box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
					font-family: sans-serif;
					display: flex;
					flex-direction: column;
				}

				.auth-close-btn {
					position: absolute;
					top: 1rem;
					right: 1rem;
					background: none;
					border: none;
					font-size: 1.5rem;
					cursor: pointer;
					color: #666;
					width: 30px;
					height: 30px;
					display: flex;
					align-items: center;
					justify-content: center;
					border-radius: 50%;
					transition: all 0.3s ease;
				}

				.auth-close-btn:hover:not(:disabled) {
					background-color: #f0f0f0;
					color: #000;
				}

				.auth-close-btn:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}

				.auth-tabs {
					display: flex;
					margin-bottom: 2rem;
					border-bottom: 1px solid black;
					position: relative;
				}

				.auth-tabs::after {
					content: '';
					position: absolute;
					left: 50%;
					top: 0;
					bottom: 0;
					width: 1px;
					background-color: black;
					transform: translateX(-50%);
					height: 100%;
				}

				.auth-tab {
					flex: 1;
					padding: 0.75rem;
					background: none;
					border: none;
					align-items: center;
					font-size: 1rem;
					cursor: pointer;
					border-bottom: 2px solid transparent;
					color: #666;
					transition: all 0.3s ease;
					font-weight: 500;
				}

				
				.auth-tab:hover:not(:disabled) {
					color: rgb(0, 0, 0);
				}

				.auth-tab:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}

				.auth-error {
					background-color: #fee;
					border: 1px solid #fcc;
					color: #c33;
					padding: 0.75rem;
					border-radius: 6px;
					margin-bottom: 1rem;
					font-size: 0.9rem;
					text-align: center;
				}

				.auth-form-container {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					flex: 1;
					padding: 0 2rem;
				}

				.auth-form {
					width: 100%;
					max-width: 400px;
					margin-bottom: 1.5rem;
				}

				.auth-field {
					margin-bottom: 1rem;
					text-align: center;
				}

				.auth-label {
					display: block;
					margin-bottom: 0.5rem;
					font-weight: 500;
					color: #007bff;
					font-size: 0.9rem;
					text-align: left;
				}

				.auth-input {
					width: 100%;
					padding: 0.75rem;
					border: 1px solid black;
					border-radius: 12px;
					font-size: 1rem;
					box-sizing: border-box;
					transition: border-color 0.3s ease;
					text-align: center;
				}

				.auth-input:focus {
					outline: none;
					border-color: #007bff;
					box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
				}

				.auth-input:disabled {
					background-color: #f5f5f5;
					cursor: not-allowed;
				}

				.auth-submit-btn {
	width: 100%;
	max-width: 200px;
	padding: 0.75rem;
	background-color: rgb(0, 0, 0);
	color: white;
	border: none;
	border-radius: 20px;
	font-size: 1rem;
	cursor: pointer;
	font-weight: 600;
	transition: background-color 0.3s ease;
	display: block; /* Add this */
	margin: 0 auto; /* Add this to center the button */
}

				.auth-submit-btn:hover:not(:disabled) {
					background-color: rgb(0, 2, 3);
				}

				.auth-submit-btn:disabled {
					background-color: #6c757d;
					cursor: not-allowed;
				}

				.auth-divider {
					display: flex;
					align-items: center;
					margin: 1.5rem 0;
					width: 100%;
					max-width: 400px;
				}

				.auth-divider-line {
					flex: 1;
					height: 2px;
					background-color: #ddd;
				}

				.auth-divider-text {
					padding: 0 1rem;
					font-size: 0.9rem;
					color: #666;
				}

				.auth-google-btn {
					width: 100%;
					max-width: 400px;
					padding: 0.75rem;
					background-color: #fff;
					color: #333;
					border: 1px solid #ddd;
					border-radius: 6px;
					font-size: 1rem;
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 0.5rem;
					transition: all 0.3s ease;
					font-weight: 500;
				}

				.auth-google-btn:hover:not(:disabled) {
					background-color: #f8f8f8;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
				}

				.auth-google-btn:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}

				@media (max-width: 768px) {
					.auth-popup {
						width: 90%;
						height: auto;
						max-height: 90vh;
						padding: 1.5rem;
						border-radius: 20px;
					}

					.auth-form-container {
						padding: 0 1rem;
					}
				}

				@media (max-width: 480px) {
					.auth-popup {
						padding: 1rem;
						margin: 1rem;
					}

					.auth-form-container {
						padding: 0;
					}
				}
			`}</style>
		</div>
	);
};

const LandingPage: React.FC<AuthProps> = ({ auth, provider, setCurrency, setIsCurrencyModified }) => {
	const [amount, setAmount] = useState<string>("₹1,018");
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
	const [authPopupOpen, setAuthPopupOpen] = useState<boolean>(false);
	const [user, setUser] = useState<User | null>(null);

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen);
	};

	const openAuthPopup = () => {
		setAuthPopupOpen(true);
	};

	const closeAuthPopup = () => {
		setAuthPopupOpen(false);
	};

	const handleAuthSuccess = (user: User) => {
		setUser(user);
		console.log("User authenticated:", user);
		// You can add additional logic here, such as:
		// - Redirecting to a dashboard
		// - Storing user data in context/state management
		// - Making API calls to your backend
	};

	const handleSignOut = async () => {
		try {
			await auth.signOut();
			setUser(null);
			console.log("User signed out");
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	return (
		<div className="container">
			{/* SEO Meta Tags */}
			<SEOHead 
				title="Storage"
				description="Aquesa Solutions provides simple cloud storage services for all your development needs at the lowest price possible, starting at ₹1,018/mo irrespective of storage size."
				keywords="free cloud service, Aquesa Solutions, Aquesa, cloud storage, developer storage, affordable cloud storage, simple storage service"
			/>
			
			<header className="navbar">
				<div className="logo-area">
					<img className="logo" src={logo} alt="Aquesa Solutions Logo" />
					&nbsp;
					<span className="brand-name">Aquesa Solutions</span>
				</div>
				
				<div className="navbar-right">
					<nav className="nav-links desktop-nav" aria-label="Main Navigation">
						<a href="/pricing-policies">Pricing & Policies</a>
						<a href="/about-us">About Us</a>
						<a href="/contact-us">Contact Us</a>
					</nav>
					
					{/* User Authentication Status */}
					{user ? (
						<div className="user-menu">
							<span className="user-welcome">
								Welcome, {user.displayName || user.email}
							</span>
							<button onClick={handleSignOut} className="sign-out-btn">
								Sign Out
							</button>
						</div>
					) : null}
					
					<button 
						className="mobile-menu-toggle" 
						onClick={toggleSidebar} 
						aria-label="Toggle navigation menu"
						aria-expanded={sidebarOpen}
					>
						<div className="hamburger-icon">
							<span></span>
							<span></span>
							<span></span>
						</div>
					</button>
				</div>
			</header>
			<hr />

			{/* Currency Selection - Moved below navbar */}
			<div className="currency-container">
				<div className="currency-selection">
					<label htmlFor="currency-select" className="visually-hidden">Select currency:</label>
					<select
						id="currency-select"
						onChange={(e) => {
							setAmount(e.target.value === "inr" ? "₹1,018" : "$12");
							setCurrency(e.target.value);
							setIsCurrencyModified(true);
						}}
					>
						<option value="inr">India</option>
						<option value="usd">Other Country</option>
					</select>
				</div>
			</div>
			
			<div className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-hidden={!sidebarOpen}>
				<button className="sidebar-close" onClick={toggleSidebar} aria-label="Close navigation menu">×</button>
				<nav className="sidebar-content" aria-label="Mobile Navigation">
					<a href="/pricing-policies" onClick={toggleSidebar}>Pricing & Policies</a>
					<a href="/about-us" onClick={toggleSidebar}>About Us</a>
					<a href="/contact-us" onClick={toggleSidebar}>Contact Us</a>
					
					{/* Mobile User Menu */}
					{user && (
						<div className="mobile-user-menu">
							<span className="mobile-user-welcome">
								Welcome, {user.displayName || user.email}
							</span>
							<button onClick={handleSignOut} className="mobile-sign-out-btn">
								Sign Out
							</button>
						</div>
					)}
					
					<div className="sidebar-currency-selection">
						<label htmlFor="mobile-currency-select">Select Currency:</label>
						<select
							id="mobile-currency-select"
							onChange={(e) => {
								setAmount(e.target.value === "inr" ? "₹1,018" : "$12");
								setCurrency(e.target.value);
								setIsCurrencyModified(true);
							}}
						>
							<option value="inr">India (₹)</option>
							<option value="usd">Other Country ($)</option>
						</select>
					</div>
				</nav>
			</div>
			
			{sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
			
			<main className="main-content">
				<div className="content-wrapper">
					<section className="text-section">
						<h1 className="text-content"> Start&nbsp;prototyping&nbsp;your&nbsp;brain <br />child with&nbsp;us.</h1>
						<p className="text-content-2">
						Try our simple cloud services for all your development needs at lowest price as possible.
						</p>
						{!user ? (
							<button onClick={openAuthPopup} className="google-button">
								Get Started 
							</button>
						) : (
							<button className="google-button" onClick={() => console.log("Navigate to dashboard")}>
								Go to Dashboard
							</button>
						)}
						
					</section>
					
					<section className="image-section">
						<img src="/cloud.png" alt="Aquesa Cloud Storage Service Illustration" />
					</section>
				</div>

				{/* Featured Product Section */}
				<section className="featured-product-section">
					<h2 className="featured-product-heading">Featured Products</h2>
					<button className="storage-button"> &gt; </button>
					<button className="compute-button"> &gt; </button>
				</section>
				
				<section className="mobile-section">
					<button className="mobile-button">Mobile App Waitlist open soon</button>
				</section>
			</main>
			
			<footer className="footer">
				<div className="terms-privacy">
					<a href="/terms-and-conditions">Terms</a>
					<a href="/privacy-policy">Privacy</a>
				</div>
				<p className="copyright">© 2025 Aquesa Solutions Private Limited. All rights reserved.</p>
			</footer>

			{/* Authentication Popup */}
			<AuthPopup 
				isOpen={authPopupOpen}
				onClose={closeAuthPopup}
				auth={auth}
				provider={provider}
				onAuthSuccess={handleAuthSuccess}
			/>

			{/* Additional Styles for User Menu */}
			<style jsx>{`
				.user-menu {
					display: flex;
					align-items: center;
					gap: 1rem;
				}

				.user-welcome {
					font-size: 0.9rem;
					color: #333;
					max-width: 150px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.sign-out-btn {
					padding: 0.5rem 1rem;
					background-color: #dc3545;
					color: white;
					border: none;
					border-radius: 4px;
					cursor: pointer;
					font-size: 0.9rem;
					transition: background-color 0.3s ease;
				}

				.sign-out-btn:hover {
					background-color: #c82333;
				}

				.mobile-user-menu {
					padding: 1rem 0;
					border-top: 1px solid #eee;
					margin-top: 1rem;
				}

				.mobile-user-welcome {
					display: block;
					margin-bottom: 0.5rem;
					font-size: 0.9rem;
					color: #333;
				}

				.mobile-sign-out-btn {
					width: 100%;
					padding: 0.5rem;
					background-color: #dc3545;
					color: white;
					border: none;
					border-radius: 4px;
					cursor: pointer;
					font-size: 0.9rem;
				}

				.mobile-sign-out-btn:hover {
					background-color: #c82333;
				}

				@media (max-width: 768px) {
					.user-menu {
						display: none;
					}
				}
			`}</style>
		</div>
	);
}

export default LandingPage;