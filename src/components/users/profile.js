import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Camera } from "lucide-react";
import "./user.css";
import ChangePasswordForm from "./changepassword";

export default function Profile() {
    const { id, isAuthor } = useParams();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const userAccount = JSON.parse(localStorage.getItem("userAccount"))
    const [isShowChangePass, setIsShowChangePass] = useState(false)
    const navigate = useNavigate()
    if(userAccount.id != id && userAccount.role != "Admin" ) {
        alert("You do not have permission to view this page")
        navigate("/homepage")
    }
    let isViewByAuthor = false;
    if (isAuthor == "true") {
        isViewByAuthor = true
    }
    else {
        isViewByAuthor = false;
    }

    useEffect(() => {
        axios
            .get(`http://localhost:9999/users/${id}`)
            .then((res) => {
                setUser(res.data);
                setFormData(res.data);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleToggleStatus = () => {
        setFormData(prev => ({
            ...prev,
            status: prev.status === "active" ? "inactive" : "active"
        }));
    };


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, avatar: reader.result });
        };
        reader.readAsDataURL(file);
    };
    const PhoneRegex = /^(?:\+?84|0)[ .-]?(?:3|5|7|8|9)(?:[ .-]?\d){8}$/;

    const handleSave = () => {
        if(!PhoneRegex.test(formData.phone)) {
            alert("Phone number must be in Vietnamese format, starting with 0 and having 10 digits")
            return 
        }
        axios
            .patch(`http://localhost:9999/users/${id}`, {
                username: formData.username,
                phone: formData.phone,
                avatar: formData.avatar,
                status: formData.status,
            })
            .then(() => {
                alert("Update successful!");
                setUser(formData);
                setIsEditing(false);
                localStorage.setItem("userAccount", JSON.stringify(formData));
            })
            .catch(() => alert("An error occurred during update!"));
    };

    if (loading) return <p>Loading data...</p>;
    if (!user) return <p>User not found!</p>;

    return (
        <Container className="user-profile-container">
            <h1 className="text-center">User Profile</h1>
            <Row>

                <Col md={4} className="text-center">
                    <div className="avatar-wrapper">
                        <img
                            src={formData.avatar}
                            alt="avatar"
                            className="avatar-img"
                        />
                        {isEditing && (
                            <>
                                <input
                                    type="file"
                                    id="fileInput"
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="fileInput" className="camera-icon">
                                    <Camera size={24} />
                                </label>
                            </>
                        )}
                    </div>


                    <div className="profile-note">
                        <p><strong>Note:</strong></p>
                        <ul>
                            <li>Fields marked with <span className="required">*</span> can be edited</li>
                            <li>You can change your avatar by clicking the <Camera size={14} /> icon</li>
                            <li>The <b>Status</b> can be toggled on/off. If you turn off status, you will not be able to log in, so be careful before editing. Contact the library if you need to reactivate your account</li>
                        </ul>
                    </div>
                </Col>


                <Col md={8}>
                    {isShowChangePass ? <ChangePasswordForm setIsShowChangePass={setIsShowChangePass} /> :
                        <>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>ID</Form.Label>
                                    <Form.Control value={formData.id} readOnly />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username <span className="required">*</span></Form.Label>
                                    <Form.Control
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control value={formData.email} readOnly />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone <span className="required">*</span></Form.Label>
                                    <Form.Control
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <div
                                        className={`status-toggle ${formData.status === "active" ? "active" : "inactive"}`}
                                        onClick={isEditing ? handleToggleStatus : undefined}
                                    >
                                        <div className="toggle-circle"></div>
                                    </div>
                                </Form.Group>



                                <Form.Group className="mb-3">
                                    <Form.Label>Role</Form.Label>
                                    <Form.Control value={formData.role} readOnly />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Created At</Form.Label>
                                    <Form.Control value={formData.createdAt} readOnly />
                                </Form.Group>
                            </Form>
                            {isViewByAuthor ? 
                                <div className="button-group">
                                    {!isEditing ? (
                                        <>
                                            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                                            <Button onClick={() => setIsShowChangePass(true)}>Change Password</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button variant="success" onClick={handleSave}>
                                                Save
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setFormData(user);
                                                    setIsEditing(false);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                </div> : 
                                
                               <div>
                                <Button onClick = {() => navigate("/admin/viewUsers")}>
                                    Back
                                </Button>
                               </div>
                            }
                        </>
                    }

                </Col>
            </Row>
        </Container>

    );
}
