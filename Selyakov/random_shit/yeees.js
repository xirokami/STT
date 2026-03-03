const bcrypt = require('bcrypt');
const saltRounds = 10;
const password = 'gog123';
const password1 = '321gog';

bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
    })
})

bcrypt.compare(password, hash, function(err, result) {
})
bcrypt.compare(password1, hash, function(err, result){
})
console.log(result)