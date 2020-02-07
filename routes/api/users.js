const express = require('express');
const router   = express.Router();
const{check, validationResult} = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User')

router.get("/", (req, res)=>res.send('User route') );

router.post("/", [check('name', 'Name is required').notEmpty(),
                  check('email', 'Please include a valid email').isEmail(),
                  check('password', 'Enter password of 6 char atleast').isLength({min: 6})],
              async (req, res)=>{
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({errors: errors.array()});
                }
                const {name, email, password} = req.body;
               try{
                   let user = await User.findOne({email});
                   if  (user){
                       return res.status(400).json({errors: [{msg: 'User already exists'}]});
                   }

                const avatar = gravatar.url(email, {
                  s: '200',
                  r: 'pg',
                  d: 'mm'
                });

                user = new User({
                  name, email, avatar, password
                });

                const salt = await bcrypt.genSalt(10);
                console.log(salt);
                user.password = await bcrypt.hash(password, salt);

                await user.save();

                const payload = {
                  user: {
                    id: user.id
                  }
                }

                jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 360000},
                              (err, token)=>{
                                if (err) throw err;
                                res.send({token})
                              } );
                

//                res.send(`User ${name} is now registered`); 
               } catch{
                 res.status(500).send('Server error'); 
               }


            }
);

module.exports = router;