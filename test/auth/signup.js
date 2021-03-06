const expect = require('chai').expect;
const request = require('supertest');
const utils = require('../../server/utils/utils');
const User = require('../../server/api/user/userModel');

const app = require('../../server/server');

describe('Signup', () => {

    beforeEach((done) => {
        utils.clearDatabase(done);
    });

    it('should create an account', (done) => {
        request(app).post('/api/auth/signup')
            .send({
                email: "user@email.com",
                password: "password",
                confirmPassword: "password"
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(201);
                done();
            })
    });

    it('shoud throw an error if the required fields are not specified', (done) => {
        request(app).post('/api/auth/signup')
            .send({})
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.have.property('error');
                expect(res.body.error).to.have.members([
                    'The email is required',
                    'The password is required',
                    'The confirm password field is required'
                ]);
                done();
            })
    });

    it('shoud throw an error if the email is not valid', (done) => {
        request(app).post('/api/auth/signup')
            .send({
                email: "invalidEmail",
                password: "password",
                confirmPassword: "password"
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.eql({
                    error: 'The email is not valid'
                });
                done();
            })
    });

    it('should throw an error if the email is taken', (done) => {
        const user = new User({
            email: "user@email.com",
            password: "password",
            verificationToken: "token",
            verified: false
        });

        return user.save((err, user) => {
            request(app).post('/api/auth/signup')
            .send({
                email: "user@email.com",
                password: "password",
                confirmPassword: "password"
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(409);
                expect(res.body).to.eql({
                    error: 'The email is taken'
                });
                done();
            })
        });
    })

    it('shoud throw an error if the passwords do not match', (done) => {
        request(app).post('/api/auth/signup')
            .send({
                email: "user@email.com",
                password: "password",
                confirmPassword: "another password"
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.eql({
                    error: 'Password and confirm password do not match'
                });
                done();
            })
    });
});

describe('Confirm account', () => {
    const verificationToken = 'token';
    const email = 'user@example.com';
    const password = 'password';

    beforeEach((done) => {
        utils.clearDatabase(() => {
            const user = new User({
                email: email,
                password: password,
                verificationToken: verificationToken,
                verified: false
            });

            return user.save((err, user) => {
                done();
            });
        });
    });

    it('should confirm an account', (done) => {
        request(app).post('/api/auth/signup/verify-account')
            .send({
                verificationToken: verificationToken
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                User.findOne({ email: email }, (err, user) => {
                    expect(user).to.not.be.null;
                    expect(user.verificationToken).to.be.null;
                    expect(user.verified).to.be.true;
                    done();
                });
            })
    });

    it('should thrown an error if the token parameter is missing from the request', (done) => {
        request(app).post('/api/auth/signup/verify-account')
            .send({})
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.eql({
                    error: 'The verification token is required'
                });
                done();
            })
    });

    it("should thrown an error if the provided token doesn't exist in the db", (done) => {
        request(app).post('/api/auth/signup/verify-account')
            .send({
                verificationToken: 'non-existing-token'
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(404);
                expect(res.body).to.eql({
                    error: "The account doesn't exists"
                });
                done();
            })
    });
});