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
                    alert('Tài khoản Email không tồn tại trong hệ thống')
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
                message: `Xin chào ${user?.username || "bạn"}, đây là mã OTP để đặt lại mật khẩu: ${otp}. Vui lòng không chia sẻ mã này cho bất kỳ ai khác.`
            },
            publicKey
        )
            .then((result) => {
                alert("OTP đã gửi thành công!");
                console.log("SUCCESS:", result);
            })
            .catch((error) => {
                alert("Lỗi gửi mail!");
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
            alert('Xác minh OTP thành công, bạn cần nhập mật khẩu mới')
        } else {
            alert('Mã OTP không chính xác')
        }

    }

    const handleReset = (e) => {
        e.preventDefault();

        if (!cpassword.trim() || !password.trim()) {
            alert('Mật khẩu không được để trống')
            return
        }

        if (cpassword !== password) {
            alert('Mật khẩu không khớp')
            return
        }

         const checkPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

        if (!checkPass.test(password)) {
            alert("Mật khẩu phải có chữ hoa, chữ thường, số, ký tự đặc biệt và đọ dài trên 6 ký tự");
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
                        alert('Cập nhật mật khẩu thành công')
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
                            <h2 className="auth-title">Bạn Quên Mật Khẩu?</h2>
                            <p className="auth-subtitle">Đừng lo, chúng tôi sẽ giúp bạn khôi phục lại tài khoản ngay!</p>
                        </div>

                        {!showOtp && !showNewPass && (
                            <Form onSubmit={handleSendOTP}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="form-lable">
                                        <i className="bi bi-envelope me-2"></i>Email *
                                    </Form.Label>
                                    <Form.Control className="auth-input" type="email" placeholder="Nhập email..." onChange={(e) => setEmail(e.target.value)} required></Form.Control>
                                </Form.Group>

                                <Button className="auth-button w-100 mt-2" type="submit">
                                    <i className="bi bi-person-plus me-2"></i>Gửi
                                </Button>

                                <div className="text-center mt-2 login-link">
                                    Bạn chưa có tài khoản? <Link to={`/login`} className="login-link-text">Đăng nhập</Link>
                                </div>
                            </Form>
                        )}

                        {showOtp && !showNewPass && (
                            <Form onSubmit={handleOTP}>

                                <Form.Group className="mb-3">
                                    <Form.Label className="form-label">
                                        <i className="bi bi-lock me-2"></i>Mã OTP *
                                    </Form.Label>
                                    <Form.Control className="auth-input" type="number" placeholder="Nhập mã OTP..." onChange={e => setOtp(e.target.value)} required></Form.Control>
                                </Form.Group>

                                <Button className="auth-button w-100 mt-2" type="submit">
                                    <i className="bi bi-person-plus me-2"></i>Xác nhận OTP
                                </Button>
                                <Col className="text-center mt-2 login-link">
                                    <a href='' onClick={handleResend} style={{ textDecoration: 'none' }}>Gửi lại mã OTP</a>
                                </Col>
                            </Form>
                        )}

                        {showNewPass && (
                            <Form onSubmit={handleReset}>

                                <Form.Group className="mb-3">
                                    <Form.Label className="form-label">
                                        <i className="bi bi-lock me-2"></i>Mật khẩu *
                                    </Form.Label>
                                    <Form.Control className="auth-input" type="password" placeholder="Nhập mật khẩu..." onChange={e => setPassword(e.target.value)} required></Form.Control>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="form-label">
                                        <i className="bi bi-lock me-2"></i>Xác nhận mật khẩu *
                                    </Form.Label>
                                    <Form.Control className="auth-input" type="password" placeholder="Nhập lại mật khẩu..." onChange={e => setCpassword(e.target.value)} required></Form.Control>
                                </Form.Group>

                                <Button className="auth-button w-100 mt-2" type="submit">
                                    <i className="bi bi-person-plus me-2"></i>Cập nhật mật khẩu
                                </Button>
                            </Form>
                        )}
                    </div>
                </Col>

            </Row>
        </Container >
    )
}