import { Card } from "@mui/material"
import { SubPageHeader } from "../SubPageHeader"
import React from "react"
import { Link } from "react-router-dom"

export default function DashboardReportsCard() {
    return (
        <Link to="/admin/reports" style={{ textDecoration: 'none' }}>
            <Card sx={{ p: 2, height: '100%', width: '100%', backgroundImage: 'url(https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?q=80&w=2070)', backgroundSize: 'cover', backgroundPosition: 'center', color: 'white' }}>
                <SubPageHeader title="Reports"/>
            </Card>
        </Link>
    )
}
