import { Card } from "@mui/material"
import { SubPageHeader } from "../SubPageHeader"
import React from "react"
import { Link } from "react-router-dom"

export default function DashboardArtworksCard() {
    return (
        <Link to="/admin/arts" style={{ textDecoration: 'none' }}>
            <Card sx={{ p: 2, height: '100%', width: '100%', backgroundImage: 'url(https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070)', backgroundSize: 'cover', backgroundPosition: 'center', color: 'white' }}>
                <SubPageHeader title="Artworks"/>
            </Card>
        </Link>
    )
}
