import {Box, Button, Card} from "@mui/material"
import { grey } from "@mui/material/colors"
import { SubPageHeader } from "../SubPageHeader"
import React from "react"
import { useNavigate } from "react-router-dom"


export default function DashboardArtistsCard() {

    const handleClick = () => {
        // navigate to artists page (not implemented yet)
        window.location.href = "/admin/artists"
    }

    return (
        <Card sx={{ p: 2, height: '100%', width: '100%', backgroundImage: 'url(https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=2070)', backgroundSize: 'cover', backgroundPosition: 'center', color: 'white' }}>
            <SubPageHeader title="Artists"/>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Button variant="contained" onClick={handleClick}>
                    View All Artists
                </Button>
            </Box>
        </Card>
    )
}