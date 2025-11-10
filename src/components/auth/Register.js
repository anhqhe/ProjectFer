import { Col, Container, Row, Form, Button, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import bcrypt from 'bcryptjs'
import './Auth.css'

export default function Register() {
    const [id, setId] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [Cpassword, setCpassword] = useState('')
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();

        if (!password.trim() || !Cpassword.trim()) {
            alert('You need to fill in all information')
            return
        }
        if (password !== Cpassword) {
            alert('Passwords do not match')
            return
        }

        const checkPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
        if (!checkPass.test(password)) {
            alert("Password must contain uppercase, lowercase, number, special character and be at least 6 characters long");
            return
        }

        const randomHashPass = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(password, randomHashPass);

        axios.get('http://localhost:9999/users')
            .then(result => {
                const userList = result.data
                const checkEmail = userList.find(e => e.email === email)
                const checkId = userList.find(e => e.id === id)
                if (checkEmail) {
                    alert("Email already exists in the system")
                    return
                }
                if (checkId) {
                    alert("ID already exists in the system")
                    return
                }

                const newUser = {
                    id: id,
                    role: 'Student',
                    username: id.toLowerCase(),
                    email: email,
                    password: hashPass,
                    avatar: "https://cdn-icons-png.flaticon.com/512/362/362003.png",
                    phone: null,
                    status: "active",
                    createdAt: new Date(),
                };

                axios.post('http://localhost:9999/users', newUser)
                    .then(result => {
                        if (result.data != null) {
                            const user = result.data
                            localStorage.setItem("userAccount", JSON.stringify(user))
                            alert('Register success')
                            navigate('/login')
                        } else {
                            alert('Register false')
                        }
                    })
                    .catch(err => console.error(err))
            })
            .catch(err => console.error(err))
    }

    return (
        <Container className="register-container" fluid>
            <Row className="justify-content-center mt-4" style={{ minHeight: "50vh" }}>
                <Col md={6} className="px-4 mt-4">
                    <div className="auth-container mt-4">
                        <div className="text-center mb-4">
                            <h2 className="auth-title">Register Account</h2>
                            <p className="auth-subtitle">Join the library today</p>
                        </div>

                        <Form onSubmit={handleRegister}>
                            <Form.Group className="mb-3">
                                <Form.Label>Student ID or Staff ID *</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><i className="bi bi-person-badge"></i></InputGroup.Text>
                                    <Form.Control
                                        className="auth-input"
                                        type="text"
                                        placeholder="Enter Student ID or Staff ID..."
                                        value={id}
                                        onChange={e => setId(e.target.value)}
                                        required
                                    />
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Email *</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><i className="bi bi-envelope"></i></InputGroup.Text>
                                    <Form.Control
                                        className="auth-input"
                                        type="email"
                                        placeholder="Enter email..."
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Password *</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><i className="bi bi-lock"></i></InputGroup.Text>
                                    <Form.Control
                                        className="auth-input"
                                        type="password"
                                        placeholder="Enter password..."
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Confirm Password *</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><i className="bi bi-lock"></i></InputGroup.Text>
                                    <Form.Control
                                        className="auth-input"
                                        type="password"
                                        placeholder="Re-enter password..."
                                        value={Cpassword}
                                        onChange={e => setCpassword(e.target.value)}
                                        required
                                    />
                                </InputGroup>
                            </Form.Group>

                            <Button className="auth-button w-100" type="submit">
                                <i className="bi bi-person-plus me-2"></i>Create Account
                            </Button>
                        </Form>

                        <div className="text-center mt-4 login-link">
                            Already have an account? <Link to={`/login`} className="login-link-text">Login</Link>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    )
}
