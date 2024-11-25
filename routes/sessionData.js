import express from 'express';

const sessionData = express.Router();

sessionData.get('/', async (req, res) => {
	try{
		res.send({
			vendor : req.session.vendor,
			foodservice  : req.session.foodservice,
			id  : req.session.Uid
		});
	} catch (e){
		res.status(400).json({message: 'No session data'})
	}
});
sessionData.get('/logout', async (req, res) => {
	try{
		req.session.destroy();
		res.redirect('/');	
	} catch (e){
		res.status(400).json({message: 'No session data'})
	}
});

export default sessionData;