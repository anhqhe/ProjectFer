import axios from "axios";
import { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import './Auth.css'
import bcrypt from "bcryptjs";
import emailjs from "emailjs-com"

export default function ForgotPassword() {
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;


    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [cpassword, setCpassword] = useState('')

    const [genOtp, setGenOtp] = useState('')
    const [otp, setOtp] = useState('')
    const [showOtp, setShowOtp] = useState(false)
    const [showNewPass, setShowNewPass] = useState(false)
    const navigate = useNavigate()

    const handleSendOTP = (e) => {
        e.preventDefault()
        axios.get('http://localhost:9999/users')
            .then(result => {
                const userList = result.data
                const checkEmail = userList.find(u => u.email === email)
                const user = userList.find(u => u.email === email)
                if (!checkEmail) {
                    alert('Email account does not exist in the system')
                    return
                }
                setShowOtp(true)
                const otpRandom = Math.floor(100000 + Math.random() * 900000).toString();
                setGenOtp(otpRandom)
                sendMail(user ,otpRandom)
            })
            .catch(err => console.error(err))

    }
    const sendMail = (user ,otp) => {
    
        emailjs.send(
            serviceId,
            templateId,
            {
                from_name: "System Bot",
                to_email: user?.email,
                message: `Hello ${user?.username || "there"}, this is your OTP code to reset your password: ${otp}. Please do not share this code with anyone.`
            },
            publicKey
        )
            .then((result) => {
                alert("OTP sent successfully!");
                console.log("SUCCESS:", result);
            })
            .catch((error) => {
                alert("Error sending email!");
                console.error("FAILED:", error);
            });
    };

    const handleResend = (e) => {
        e.preventDefault()

        const otpRandom = Math.floor(100000 + Math.random() * 900000).toString();
        setGenOtp(otpRandom)
        setShowOtp(true)
        axios.get('http://localhost:9999/users')
            .then(result => {
                const userList = result.data
                const user = userList.find(u => u.email === email)
                sendMail(user,otpRandom);
            })
            .catch(err => console.error(err))
    }

    const handleOTP = (e) => {
        e.preventDefault()

        if (otp === genOtp) {
            setShowNewPass(true)
            alert('OTP verification successful, please enter a new password')
        } else {
            alert('Incorrect OTP code')
        }

    }

    const handleReset = (e) => {
        e.preventDefault();

        if (!cpassword.trim() || !password.trim()) {
            alert('Password cannot be empty')
            return
        }

        if (cpassword !== password) {
            alert('Passwords do not match')
            return
        }

         const checkPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

        if (!checkPass.test(password)) {
            alert("Password must contain uppercase, lowercase, number, special character and be at least 6 characters long");
            return
        }

        const ranHashPass = bcrypt.genSaltSync(10)
        const hassPass = bcrypt.hashSync(password, ranHashPass)

        axios.get('http://localhost:9999/users')
            .then(result => {
                const userList = result.data
                const acc = userList.find(e => e.email === email)

                const userId = acc.id

                const newPass = {
                    password: hassPass
                }

                axios.patch(`http://localhost:9999/users/${userId}`, newPass)
                    .then(result => {
                        alert('Password updated successfully')
                        navigate('/login')
                    })
                    .catch(err => console.error(err))
            })
            .catch(err => console.error(err))
    }

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6} className="px-4">
                    <div className="auth-container">

                        <div className="text-center mb-4">
                            <h2 className="auth-title">Forgot Your Password?</h2>
                            <p className="auth-subtitle">Don't worry, we'll help you recover your account right away!</p>
                        </div>

                        {!showOtp && !showNewPass && (
                            <Form onSubmit={handleSendOTP}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="form-lable">
                                        <i className="bi bi-envelope me-2"></i>Email *
                                    </Form.Label>
                                    <Form.Control className="auth-input" type="email" placeholder="Enter email..." onChange={(e) => setEmail(e.target.value)} required></Form.Control>
                                </Form.Group>

                                <Button className="auth-button w-100 mt-2" type="submit">
                                    <i className="bi bi-person-plus me-2"></i>Send
                                </Button>

                                <div className="text-center mt-2 login-link">
                                    Don't have an account? <Link to={`/login`} className="login-link-text">Login</Link>
                                </div>
                            </Form>
                        )}

                        {showOtp && !showNewPass && (
                            <Form onSubmit={handleOTP}>

                                <Form.Group className="mb-3">
                                    <Form.Label className="form-label">
                                        <i className="bi bi-lock me-2"></i>OTP Code *
                                    </Form.Label>
                                    <Form.Control className="auth-input" type="number" placeholder="Enter OTP code..." onChange={e => setOtp(e.target.value)} required></Form.Control>
                                </Form.Group>

                                <Button className="auth-button w-100 mt-2" type="submit">
                                    <i className="bi bi-person-plus me-2"></i>Verify OTP
                                </Button>
                                <Col className="text-center mt-2 login-link">
                                    <a href='' onClick={handleResend} style={{ textDecoration: 'none' }}>Resend OTP code</a>
                                </Col>
                            </Form>
                        )}

                        {showNewPass && (
                            <Form onSubmit={handleReset}>

                                <Form.Group className="mb-3">
                                    <Form.Label className="form-label">
                                        <i className="bi bi-lock me-2"></i>Password *
                                    </Form.Label>
                                    <Form.Control className="auth-input" type="password" placeholder="Enter password..." onChange={e => setPassword(e.target.value)} required></Form.Control>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="form-label">
                                        <i className="bi bi-lock me-2"></i>Confirm Password *
                                    </Form.Label>
                                    <Form.Control className="auth-input" type="password" placeholder="Re-enter password..." onChange={e => setCpassword(e.target.value)} required></Form.Control>
                                </Form.Group>

                                <Button className="auth-button w-100 mt-2" type="submit">
                                    <i className="bi bi-person-plus me-2"></i>Update Password
                                </Button>
                            </Form>
                        )}
                    </div>
                </Col>

            </Row>
        </Container >
    )
}