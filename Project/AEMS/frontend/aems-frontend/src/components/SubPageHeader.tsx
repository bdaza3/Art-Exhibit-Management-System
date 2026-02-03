import { Box } from "@mui/material";
import { grey } from "@mui/material/colors";
import React from "react";

export const SubPageHeader = ({ title }: { title: string }) => {
    return (
        <Box sx={{ 
            bgcolor: grey[50], 
            height: '100px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 2
        }}>
            <h2 style={{ color: grey[800] }}>{title}</h2>
        </Box>
    )
}