const express = require('express');
const router   = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const{ check, validationResult } = require('express-validator/check');

router.get("/me", auth, async (req, res)=>{

    try{
       const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
       if (!profile){
           return res.status(400).send({message: "There is no profile for this user"});
       }

       res.json(profile);

    }catch(err){
        console.log(err.message);
        res.status(500).send('Server error')
    }

} );

// @route: POST api/profile
// @desc: Create or update profile
// @access: private

let checks = [check('status', 'Status is required').not().isEmpty(),
              check('skills', 'Skills is required').not().isEmpty()];

let middleware = [auth, checks];

router.post("/", middleware, async (req, res)=>{

           const errors = validationResult(req);
               
            if (!errors.isEmpty()){
                return res.status(400).send({errors: errors.array()});
            }    
                
            const {
                company,
                website,
                location,
                bio,
                status,
                githubusername,
                skills,
                youtube,
                facebook,
                twitter,
                instagram,
                linkedin
              } = req.body;

              const profileFields = {};
              profileFields.user = req.user.id;
              if (company) profileFields.company = company;
              if (website) profileFields.website = website;
              if (location) profileFields.location = location;
              if (bio) profileFields.bio = bio;
              if (status) profileFields.status = status;
              if (githubusername) profileFields.githubusername = githubusername;
              if(skills) profileFields.skills = skills.split(',').map(skill=>skill.trim());
              
              // Build social object
                profileFields.social = {};
                if (youtube) profileFields.social.youtube = youtube;
                if (twitter) profileFields.social.twitter = twitter;
                if (facebook) profileFields.social.facebook = facebook;
                if (linkedin) profileFields.social.linkedin = linkedin;
                if (instagram) profileFields.social.instagram = instagram;


                try{
                    let profile = await Profile.findOne({user: req.user.id});
                    
                    if(profile){ //update if found
                       profile = await Profile.findOneAndUpdate({user: req.user.id}, { $set: profileFields }, { new: true });
                                           
                     return res.json(profile);
                    }
                    //create (not found profile)
                    profile = new Profile(profileFields);
                    await profile.save();
                    res.json(profile);

                }catch(err){
                    console.log(err.message);
                    res.status(500).send('Server Error');
                }

    }
)

// @route: GET api/profile
// @desc: Get all profiles
// @access: public

router.get("/", async (req, res)=>{

    try{
       const profiles = await Profile.find().populate('user', ['name', 'avatar']);
       res.json(profiles);

    }catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }

})

// @route: GET api/profile/user/:user_id
// @desc: Get profile by user id
// @access: public

router.get("/user/:user_id", async (req, res)=>{

    try{
       const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);

       if (!profile){
           return res.status(400).json({msg: 'There is no profile for this user'});
       }

       res.json(profile);
       
    }catch(err){
        console.log(err.message);
        if (err.kind == 'ObjectId'){
            return res.status(400).json({msg: 'There is no profile for this user'});
        }
        res.status(500).send('Server Error');
    }

})

// @route: DELETE api/profile
// @desc: Delete profile, user and posts
// @access: private

router.delete("/", auth, async (req, res)=>{

    try{
        //todo remove posts

        //remove profile 
        await Profile.findOneAndRemove({user: req.user.id});
        //remove user
        await User.findOneAndRemove({_id: req.user.id});
       res.json({msg: 'User removed'});

    }catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }

})

module.exports = router;