import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      userRole: user.userRole,
      handmade: user.handmade,
      description: user.description,
      shop: user.shop,
      logo: user.logo,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length);
    jwt.verify(
      token,
      process.env.JWT_SECRET,
      (err, decode) => {
        if (err) {
          res.status(401).send({message: 'Invalid Token'})
        } else {
          req.user = decode;
          next();
        }
      }
    );
  } else {
    res.status(401).send({message: "No Token"});
  }
}

export const isSeller = (req, res, next) => {
  if (req.user && req.user.userRole === 'seller') {
    next();
  } else {
    res.status(401).send({message: 'Invalid User'});
  }
}

export const isBuyer = (req, res, next) => {
  if (req.user && req.user.userRole === 'buyer') {
    next();
  } else {
    res.status(401).send({message: 'Invalid User'});
  }
}
