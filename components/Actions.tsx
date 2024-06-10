import React from 'react';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface ActionsProps {
    bookId: number;
    onEdit: (bookId: number) => void;
    onDelete: (bookId: number) => void;
}

const Actions: React.FC<ActionsProps> = ({ bookId, onEdit, onDelete }) => {
    return (
        <div>
            <IconButton onClick={() => onEdit(bookId)}>
                <EditIcon />
            </IconButton>
            <IconButton onClick={() => onDelete(bookId)}>
                <DeleteIcon />
            </IconButton>
        </div>
    );
};

export default Actions;
