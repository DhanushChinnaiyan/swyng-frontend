import { Typography } from '@mui/material';
import './App.css';
import Calender from './Components/Calender/Calender';

function App() {
  return (
    <div className="App">
      <Typography component="div" textAlign="center" className='heading' style={{fontSize:"30px",fontWeight:"bold",marginTop:"30px"}}>BOOK YOUR SLOTS</Typography>
      <Calender/>
    </div>
  );
}

export default App;
