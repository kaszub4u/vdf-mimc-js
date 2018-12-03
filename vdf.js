var BN = require('bn.js');
var crypto = require('crypto');

var utils = require('./utils.js');

var size = 256;

var p = (new BN(2, 10).pow(new BN(256, 10))).sub(new BN(351).mul(new BN(2, 10).pow(new BN(32, 10)))).add(new BN(1, 10))

var t = 8;
var g = new BN(3, 10);

function genKey(size)
{
    return new BN(crypto.randomBytes(size >> 3).toString('hex'), 16);
}

function hash(data)
{
    var hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
}

function modular_pow(base, exponent, modulus)
{
	var result = new BN(1, 16);
	
    if(modulus.eq(new BN(1, 16)))
		return new BN(0, 16);
		
    base = base.mod(modulus);
    
    while(exponent.gt(new BN(0, 16)))
    {
        if (exponent.mod(new BN(2, 16)).eq(new BN(1, 16)))
           result = (result.mul(base)).mod(modulus)
        exponent = exponent.shrn(1)
        base = (base.mul(base)).mod(modulus)		
	}

    return result	
}

function next(x, k)
{
	return modular_pow(x.xor(k), g, p);
}

function prev(x, k)
{
	return modular_pow(x, ((p.shln(1)).sub(new BN(1, 10))).div(g), p).xor(k)
}

function nhash(key, t)
{
	var x = hash(key);
	
	for(var i = 0; i < t; i++)
		x = hash(x);
		
	return x;
}

function vdf(key, t)
{
	var x = key.clone();
	for(var i = 0; i < t; i++)
		x = next(x, new BN(nhash(key, i), 16));
		
	return x;
}

function rvdf(key, x, t)
{
	var r = x.clone();
	for(var i = (t - 1); i >= 0; i--)
		r = prev(r, new BN(nhash(key, i), 16));	
	
	return r;
}

var pubKey = genKey(size);


var start = Date.now();

var n1 = vdf(pubKey, t);
console.log(Date.now() - start);
var n2 = rvdf(pubKey, n1, t);
console.log(Date.now() - start);

console.log(pubKey.toString(16));
console.log(n1.toString(16));
console.log(n2.toString(16));
