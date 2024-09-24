const jwt= require('jsonwebtoken');

const authenticated = (req, res, next)=> {
    const authorizationHeader= req.headers['authorization'];
    if(!authorizationHeader || authorizationHeader.startsWith('Bearer')){
        return res.status(403).json({message: 'Token is required.'});
    }

    // Extract the token from the header
    // const token = authorizationHeader.replace('Bearer ', '');

    try{
        jwt.verify(authorizationHeader, process.env.SECRET, (err, user) => {
            if (err) {
                return res.status(401).json({message: "Token is invalid, or it is expired"});
            }
        
            req.user = user;
            return next();
        });

    }catch(err){
        console.log(err)
    }
}

module.exports= authenticated