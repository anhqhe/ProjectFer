import axios from "axios";
import { useState } from "react";
import { Container, Form, FormLabel, FormSelect, InputGroup, Button } from "react-bootstrap";
import bcrypt from 'bcryptjs'
import { useNavigate } from "react-router-dom";
import './Dashboard.css'

export default function CreateAccountByAdmin() {
    const [CPassword, setCpassword] = useState('')
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("userAccount"))
    if (!user || user.role !== 'Admin') {
        alert("You do not have permission to access this page")
        navigate('/homepage')
    }
    const [account, setAccount] = useState({
        id: "",
        role: "",
        username: "NewAccount",
        password: "",
        email: "",
        phone: null,
        avatar: "https://cdn-icons-png.flaticon.com/512/362/362003.png",
        status: "active",
        createdAt: new Date(),
    })

    const handleCreate = (e) => {
        e.preventDefault();

        if (!account.password.trim() || !CPassword.trim()) {
            alert('Please input full form')
            return
        }
        if (account.password !== CPassword) {
            alert('Confirm password not match')
            return
        }

        const checkPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
        if (!checkPass.test(account.password)) {
            alert("Password must contain uppercase, lowercase, number, special character and be at least 6 characters long");
            return
        }

        const randomHashPass = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(account.password, randomHashPass);

        let newAccount = {...account,password: hashPass}

        axios.get('http://localhost:9999/users')
            .then(result => {
                const userList = result.data
                const checkEmail = userList.find(e => e.email === account.email)
                const checkId = userList.find(e => e.id === account.id)
                if (checkEmail) {
                    alert("Email already exists in the system")
                    return
                }
                if (checkId) {
                    alert("ID already exists in the system")
                    return
                }

                axios.post('http://localhost:9999/users', newAccount)
                    .then(result => {
                        if (result.data != null) {
                            const user = result.data
                            localStorage.setItem("userAccount", JSON.stringify(user))
                            alert('Register success')
                        } else {
                            alert('Register false')
                        }
                    })
                    .catch(err => console.error(err))
            })
            .catch(err => console.error(err))
    }
    return (
        <Container className="create-account-box p-4" fluid>
            <h1 className="dashboard-title">Create Account</h1>
            <Form onSubmit={handleCreate} className="create-account-form">
                <Form.Group className="mb-3">
                    <Form.Label>Student ID or Staff ID *</Form.Label>
                    <InputGroup>
                        <InputGroup.Text><i className="bi bi-person-badge"></i></InputGroup.Text>
                        <Form.Control
                            className="auth-input"
                            type="text"
                            placeholder="Enter Student ID or Staff ID..."
                            onChange={e => setAccount({ ...account, id: e.target.value })}
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
                            onChange={e => setAccount({ ...account, email: e.target.value })}
                            required
                        />
                    </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                    <InputGroup className="w-auto">
                        <InputGroup.Text><i className="bi bi-lock"></i></InputGroup.Text>
                        <FormSelect onChange={e => setAccount({ ...account, role: e.target.value })} required>
                            <option value="none">Select a role for account</option>
                            <option value="Student">Student</option>
                            <option value="Librarian">Librarian</option>
                        </FormSelect>
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
                            onChange={e => setAccount({ ...account, password: e.target.value })}
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
                            onChange={e => setCpassword(e.target.value)}
                            required
                        />
                    </InputGroup>
                </Form.Group>
                <div className="d-flex justify-content-start">
                    <Button className="auth-button" type="submit">
                        <i className="bi bi-person-plus me-2"></i>Create Account
                    </Button>
                </div>
            </Form>

        </Container>
    )
}