import axios from "axios";
import { useState } from "react";
import { Col, Container, Row, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";
import './Auth.css'

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = (e) => {
        e.preventDefault();

        axios.get('http://localhost:9999/users')
            .then(result => {
                const user = result.data
                const acc = user.find(a => a.email === email)

                if (!acc) {
                    alert('Email account does not exist')
                    return
                }

                const checkPass = bcrypt.compareSync(password, acc.password)

                if (!checkPass) {
                    alert('Incorrect password')
                    return
                }
                 if(acc.status === 'inactive'){
                    alert('Your account has been deactivated. Please contact the administrator for more details.')
                    return    
                }
                localStorage.setItem("userAccount", JSON.stringify(acc))
                navigate('/homepage')
            })
            .catch(err => console.error(err))
    }

    return (
        <Container className="login-container" fluid>
            <Row className="d-flex justify-content-center auth-container" style={{ minHeight: "60vh" }}>
                <Col md={7} className="d-flex justify-content-center align-items-center" >
                    <img
                        src="/images/library-logo.png"
                        alt="Library Logo"
                        className="img-fluid"
                        style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
                    />
                </Col>
                <Col md={5} className="px-4">
                    <div className="text-center mb-4 mt-4">
                        <h2 className="auth-title">Login Account</h2>
                        <p className="auth-subtitle">Knowledge Treasury</p>
                    </div>
                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label className="form-lable">
                                <i className="bi bi-envelope me-2"></i>Email *
                            </Form.Label>
                            <Form.Control className="auth-input" type="email" placeholder="Enter email..." value={email} onChange={e => setEmail(e.target.value)} required></Form.Control>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="form-label">
                                <i className="bi bi-lock me-2"></i>Password *
                            </Form.Label>
                            <Form.Control className="auth-input" type="password" placeholder="Enter password..." value={password} onChange={e => setPassword(e.target.value)} required></Form.Control>
                        </Form.Group>

                        <Row>
                            <Col>
                                <div className="text-center login-link">
                                    Don't have an account? <Link to={`/register`} className="login-link-text">Create account</Link>
                                </div>
                            </Col>

                            <Col>
                                <div className="text-center login-link">
                                    <Link to={`/forgot-password`} className="login-link-text">Forgot password?</Link>
                                </div>
                            </Col>

                        </Row>

                        <Button className="auth-button w-100 mt-2" type="submit">
                            <i className="bi bi-person-plus me-2"></i>Login
                        </Button>
                    </Form>

                </Col>
            </Row>
        </Container>
    )
}