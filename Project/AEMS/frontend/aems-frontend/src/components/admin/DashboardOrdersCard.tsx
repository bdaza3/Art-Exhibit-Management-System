import { Card } from "@mui/material"
import { SubPageHeader } from "../SubPageHeader"
import React from "react"
import { Link } from "react-router-dom"

export default function DashboardOrdersCard() {
    return (
        <Link to="/admin/orders" style={{ textDecoration: 'none' }}>
            <Card sx={{ p: 2, height: '100%', width: '100%', backgroundImage: 'url(https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=2070)', backgroundSize: 'cover', backgroundPosition: 'center', color: 'white' }}>
                <SubPageHeader title="Orders"/>
            </Card>
        </Link>
    )
}
