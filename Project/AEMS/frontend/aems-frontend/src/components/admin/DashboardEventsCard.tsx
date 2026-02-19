import { Card } from "@mui/material"
import { SubPageHeader } from "../SubPageHeader"
import React from "react"
import { Link } from "react-router-dom"

export default function DashboardEventsCard() {
    return (
        <Link to="/admin/events" style={{ textDecoration: 'none' }}>
            <Card sx={{ p: 2, height: '100%', width: '100%', backgroundImage: 'url(https://i.pinimg.com/736x/d4/e8/d1/d4e8d131a4465dd871963242f5b8770b.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', color: 'white' }}>
                <SubPageHeader title="Exhibitions"/>
            </Card>
        </Link>
    )
}
