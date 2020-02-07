const express = require('express');
const router   = express.Router();
const{check, validationResult} = require('express-validator');
const config = require('config');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get("/", auth, async (req, res)=>{
  try{
     const user = await User.findById(req.user.id).select('-password');     
     res.json(user);
  }catch(err){
      console.log(err.message);
      res.status(501).send('Server error'); 
  }


} );

let checks = [check('email', 'Please include a valid email').isEmail(),
              check('password', 'Password is required').exists()];


router.post("/", checks, async (req, res)=>{
   
    //check if user exists
    try{ 
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

    let {email, password}= req.body;
    let user = await User.findOne({email});
    if(!user){
        res.status(401).json({errors: [{msg: "invalid credentials"}]});
    } 

    //verify the password
    let isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        res.status(401).json({errors: [{msg: "invalid credentials"}]});
    }
    
    //issue JWT token
    let payload = {
        user: {
            id: user.id
        }
    } 

    jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 360000},(err, token)=>{
        if(err) throw err;
        res.json({token});
    })

}catch(err){
  console.log(err.message);  
  res.status(500).send('Server error for auth');
}
})


module.exports = router;