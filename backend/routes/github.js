const express=require('express');
const router=express.Router();

const control=require('./controllers/gitcontrol');
router.post('/api/link',control);

module.exports=router;