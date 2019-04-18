const expect = require('chai').expect;
const request = require('supertest');
const utils = require('../server/utils/utils');
const User = require('../server/api/user/userModel');

const app = require('../server/server');

describe('Signup', () => {

    beforeEach((done) => {
        utils.clearDatabase(done);
    });

    it('should create an account', (done) => {
        request(app).post('/auth/signup')
            .send({
                email: "user@email.com",
                password: "password",
                confirm_password: "password"
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(201);
                expect(res.body).to.eql({
                    status: 'success',
                    message: 'Account created'
                });
                done();
            })
    });

    it('shoud throw an error if the required fields are not specified', (done) => {
        request(app).post('/auth/signup')
            .send({})
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.have.property('status');
                expect(res.body.status).to.equal('error');
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.have.members([
                    'The email is required',
                    'The password is required',
                    'The confirm password field is required'
                ]);
                done();
            })
    });

    it('shoud throw an error if the email is not valid', (done) => {
        request(app).post('/auth/signup')
            .send({
                email: "invalidEmail",
                password: "password",
                confirm_password: "password"
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.eql({
                    status: 'error',
                    message: ['The email is not valid']
                });
                done();
            })
    });

    it('shoud throw an error if the passwords do not match', (done) => {
        request(app).post('/auth/signup')
            .send({
                email: "user@email.com",
                password: "password",
                confirm_password: "another password"
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.eql({
                    status: 'error',
                    message: ['Password and confirm password do not match']
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
        request(app).post('/auth/verify-account')
            .send({
                verificationToken: verificationToken
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.eql({
                    status: 'success',
                    message: 'Account verified'
                });
                User.findOne({ email: email }, (err, user) => {
                    expect(user.verificationToken).to.be.null;
                    expect(user.verified).to.be.true;
                    done();
                });
            })
    });

    it('should thrown an error if the token parameter is missing from the request', (done) => {
        request(app).post('/auth/verify-account')
            .send({})
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.eql({
                    status: 'error',
                    message: ['The verification token is required']
                });
                done();
            })
    });

    it("should thrown an error if the provided token doesn't exist in the db", (done) => {
        request(app).post('/auth/verify-account')
            .send({
                verificationToken: 'non-existing-token'
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(404);
                expect(res.body).to.eql({
                    status: 'error',
                    message: "The account doesn't exists"
                });
                done();
            })
    });
});