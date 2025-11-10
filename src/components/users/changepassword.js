import { useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import axios from "axios";
import bcrypt from 'bcryptjs'
import { Key, Lock } from "lucide-react";
export default function ChangePasswordForm({ setIsShowChangePass }) {
    const userAccount = JSON.parse(localStorage.getItem("userAccount"));
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const checkPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

    
    const handleChangePassword = async () => {
    const checkPassOld = bcrypt.compareSync(oldPassword, userAccount.password)
        if (!checkPassOld) {
            alert("Old password is incorrect");
            return;
        }

        if (!checkPass.test(newPassword)) {
            alert("New password must contain uppercase, lowercase, number, special character and be at least 6 characters long");
            return;
        }
       
        if (newPassword !== confirmPassword) {
            alert("Password confirmation does not match");
            return;
        }
        const randomHashPass = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(newPassword, randomHashPass);

        try {
            await axios.put(`http://localhost:9999/users/${userAccount.id}`, {
                ...userAccount,
                password: hashPass,
            });

            localStorage.setItem(
                "userAccount",
                JSON.stringify({ ...userAccount, password: hashPass})
            );

            alert("Password changed successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setIsShowChangePass(false)
        } catch (error) {
            console.error(error);
            alert("Error changing password");
        }
    };

    return (
        <Form className="p-3">
            <h4 className="mb-3">Change Password</h4>

            <Form.Group className="mb-3">
                <Form.Label>Old Password</Form.Label>
                <InputGroup>
                    <InputGroup.Text>
                        <Key size={16} />
                    </InputGroup.Text>
                    <Form.Control
                        type = "password"
                        placeholder="Enter old password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />
                </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <InputGroup>
                    <InputGroup.Text>
                        <Lock size={16} />
                    </InputGroup.Text>
                    <Form.Control
                        type = "password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <InputGroup>
                    <InputGroup.Text>
                        <Lock size={16} />
                    </InputGroup.Text>
                    <Form.Control
                        type = "password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </InputGroup>
            </Form.Group>
             <div className="button-group">
            <Button variant="success" onClick={handleChangePassword} className="w-20">
                Save
            </Button>
            <Button variant="secondary" onClick={() => {
                    setIsShowChangePass(false)
            }} className="w-20">
                Cancel
            </Button>
            </div>
        </Form>
    );
}
