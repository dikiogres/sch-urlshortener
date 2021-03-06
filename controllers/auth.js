import User from "../models/user.js"
import jwt from "jsonwebtoken"
import UrlShortenerService from '../service/urlShortener.js'

//handle error
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };

    // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }
  
    // duplicate email error
    if (err.code === 11000) {
      errors.email = 'that email is already registered';
      return errors;
    }
  
    // validation errors
    if (err.message.includes('user validation failed')) {
      // console.log(err);
      Object.values(err.errors).forEach(({ properties }) => {
        // console.log(val);
        // console.log(properties);
        errors[properties.path] = properties.message;
      });
    }
  
    return errors;
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'schematics url shortener', {
    expiresIn: maxAge
  });
};

export const signup_get = (req, res) => {
  try{
    return res.render('newSignup');
  }
  catch(err){
    return res.send(err);
  }
}
  
export const login_get = (req, res) => {
  try{
    return res.render('newLogin');
  }
  catch(err){
    return res.send(err);
  }
}
  
  export const signup_post = async (req, res) => {
    const { email, password } = req.body;
    const userServiceInstance = new UrlShortenerService(User);
    try {
        const user = await userServiceInstance.createShortUrl({ email, password });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json( { user: user._id });
      }
      catch(err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
      }
}
  
  export const login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.login(email, password);
      const token = createToken(user._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(200).json({ user: user._id });
    } 
    catch (err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  
}

export const logout_get = (req, res) => {
  try{
    res.cookie('jwt', '', { maxAge: 1 });
    return res.status(201).redirect('/');
  }
  catch (err) {
    return res.send(err);
  }

}

// function parseJwt (token) {
//   var base64Url = token.split('.')[1];
//   var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//   var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
//       return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//   }).join(''));

//   return JSON.parse(jsonPayload);
// };

export default {
    signup_get,
    login_get,
    signup_post,
    login_post,
    logout_get,
 }