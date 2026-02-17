import { Box } from "@mui/material";
import { grey, yellow } from "@mui/material/colors";
import React from "react";

export const SubPageHeader = ({ title }: { title: string }) => {
    return (
        <Box sx={{ 
            bgcolor: "transparent", 
            height: '100px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 2
        }}>
            <h2 style={{ color: yellow[700] }}>{title}</h2>
        </Box>
    )
}