import { Paper, IconButton, InputBase, CircularProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';

export default function TransactionInput({ handleSend, handleVoiceInput, input, setInput, isListening, loading }) {
    return (
        <Paper component="form" onSubmit={handleSend} elevation={10} sx={{ position: 'absolute', bottom: 20, left: 20, right: 20, p: '4px 8px', display: 'flex', alignItems: 'center', borderRadius: 8, bgcolor: '#FFF', zIndex: 10 }}>
            <IconButton color={isListening ? "error" : "primary"} onClick={handleVoiceInput} sx={{ p: '10px' }}>
                <MicIcon />
            </IconButton>
            <InputBase sx={{ ml: 1, flex: 1, py: 1 }} placeholder="Nhập (vd: Bún bò 30k)" value={input} onChange={(e) => setInput(e.target.value)} disabled={loading} />
            <IconButton type="submit" color="primary" sx={{ p: '10px' }} disabled={loading || !input.trim()}>
                {loading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
        </Paper>
    );
}
