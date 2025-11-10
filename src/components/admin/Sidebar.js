import { Col, Nav, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import './Sidebar.css'
import { useEffect } from "react";

export default function Sidebar() {
    const navigate = useNavigate()
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userAccount'));
        if (!userData || userData.role !== 'Admin') {
            navigate('/homepage');
        }
    }, [navigate]);
    const handelLogout = (e) => {
        e.preventDefault()

        localStorage.removeItem("userAccount")
        alert("Logout successful")
        navigate('/login')
    }

    return (
        <Row>
            <Col className="sidebar-container">
                <div className="sidebar-header">
                    <h5 className="mt-4">Admin Panel</h5>
                    <p>Library Portal Management System</p>
                </div>

                <Nav className="flex-column sidebar-nav">
                    <p>NAVIGATION</p>
                    <Nav.Link as={Link} to="/admin/dashboard">
                        <i className="bi bi-speedometer2"></i>
                        <span>Overview</span>
                    </Nav.Link>
                    <p>ACCOUNT MANAGEMENT</p>
                    <Nav.Link as={Link} to="/admin/viewUsers">
                        <i className="bi bi-people"></i>
                        <span>All Accounts</span>
                    </Nav.Link>
                    <p>ACTIONS</p>
                    <Nav.Link as={Link} to="/admin/create">
                        <i className="bi bi-person-plus"></i>
                        <span>Create New Account</span>
                    </Nav.Link>
                    <Nav.Link onClick={handelLogout} className="logout">
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Logout</span></Nav.Link>
                </Nav>
            </Col>
        </Row>
    )
}