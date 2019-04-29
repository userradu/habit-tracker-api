const expect = require('chai').expect;
const request = require('supertest');
const utils = require('../../server/utils/utils');
const User = require('../../server/api/user/userModel');
const bcrypt = require('bcrypt');

const app = require('../../server/server');

describe('Login', () => {

    beforeEach((done) => {
        utils.clearDatabase(done);
    });

    it('should throw an error if the required fields are not specified', (done) => {
        request(app).post('/api/auth/login')
            .send({})
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.have.property('status');
                expect(res.body.status).to.equal('fail');
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.have.property('errors');
                expect(res.body.data.errors).to.have.members([
                    'The email is required',
                    'The password is required'
                ]);
                done();
            });
    });

    it('shoud throw an error if the email is not valid', (done) => {
        request(app).post('/api/auth/login')
            .send({
                email: "invalidEmail",
                password: "password"
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.eql({
                    status: 'fail',
                    data: {
                        errors: ['The email is not valid']
                    }
                });
                done();
            });
    });

    it("should throw an error if the user doesn't exist", (done) => {
        request(app).post('/api/auth/login')
            .send({
                email: "user@email.com",
                password: "password"
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(404);
                expect(res.body).to.eql({
                    status: 'fail',
                    data: {
                        errors: ['Invalid credentials']
                    }
                });
                done();
            });
    });

    it("should throw an error if the passwords do not match", (done) => {
        bcrypt.hash("password", 10, (err, hash) => {
            const user = new User({
                email: "user@email.com",
                password: hash,
                verificationToken: null,
                verified: true
            });

            user.save((err, user) => {
                request(app).post('/api/auth/login')
                    .send({
                        email: "user@email.com",
                        password: "wrongPassword"
                    })
                    .end((err, res) => {
                        expect(res.statusCode).to.equal(404);
                        expect(res.body).to.eql({
                            status: 'fail',
                            data: {
                                errors: ['Invalid credentials']
                            }
                        });
                        done();
                    })
            });
        });
    });

    it('should login successfully a valid user', (done) => {
        bcrypt.hash("password", 10, (err, hash) => {
            const user = new User({
                email: "user@email.com",
                password: hash,
                verificationToken: null,
                verified: true
            });

            user.save((err, user) => {
                request(app).post('/api/auth/login')
                    .send({
                        email: "user@email.com",
                        password: "password"
                    })
                    .end((err, res) => {
                        expect(res.statusCode).to.equal(200);
                        expect(res.body).to.have.property('token');
                        done();
                    })
            });
        });
    });

});