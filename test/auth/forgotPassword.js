const expect = require('chai').expect;
const request = require('supertest');
const utils = require('../../server/utils/utils');
const User = require('../../server/api/user/userModel');

const app = require('../../server/server');

describe('Forgot password', () => {

    describe('Send reset password email', () => {

        beforeEach((done) => {
            utils.clearDatabase(done);
        });

        it('should throw an error if no email is supplied', (done) => {
            request(app).post('/api/auth/forgot-password')
                .send({})
                .end((err, res) => {
                    expect(res.statusCode).to.equal(400);
                    expect(res.body).to.eql({
                        error: 'The email is required'
                    });
                    done();
                });
        });

        it('should throw an error if the email is not valid', (done) => {
            request(app).post('/api/auth/forgot-password')
                .send({
                    email: "invalidEmail"
                })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(400);
                    expect(res.body).to.eql({
                        error: 'The email is not valid'
                    });
                    done();
                });
        });

        it("should throw an error if the user doesn't exists", (done) => {
            request(app).post('/api/auth/forgot-password')
                .send({
                    email: "user@email.com"
                })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(404);
                    expect(res.body).to.eql({
                        error: "The account doesn't exists"
                    });
                    done();
                });
        });

        it('should sent a reset password email', (done) => {
            const email = "user@email.com";

            const user = new User({
                email: email,
                password: "password"
            });

            return user.save((err, user) => {
                request(app).post('/api/auth/forgot-password')
                    .send({
                        email: email
                    })
                    .end((err, res) => {
                        expect(res.statusCode).to.equal(200);

                        User.findOne({ email: email }, (err, user) => {
                            expect(user.resetPasswordToken).to.not.be.null;
                            expect(user.resetPasswordExpires).to.not.be.null;
                            done();
                        });
                    });
            });
        });
    });

    describe('Reset password', () => {

        beforeEach((done) => {
            utils.clearDatabase(done);
        });

        it('should throw an error if the required fields are not provided', (done) => {
            request(app).post('/api/auth/forgot-password/reset')
                .send({})
                .end((err, res) => {
                    expect(res.statusCode).to.equal(400);
                    expect(res.body).to.have.property('error');
                    expect(res.body.error).to.have.members([
                        'The email is required',
                        'The password is required',
                        'The confirm password field is required',
                        'The token is required'
                    ]);
                    done();
                });
        });

        it('shoud throw an error if the email is not valid', (done) => {
            request(app).post('/api/auth/forgot-password/reset')
                .send({
                    email: "invalidEmail",
                    password: "password",
                    confirm_password: "password",
                    token: "token"
                })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(400);
                    expect(res.body).to.eql({
                        error: 'The email is not valid'
                    });
                    done();
                })
        });

        it("should throw an error if the user doesn't exists", (done) => {
            request(app).post('/api/auth/forgot-password/reset')
                .send({
                    email: "user@email.com",
                    password: "password",
                    confirm_password: "password",
                    token: "token"
                })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(404);
                    expect(res.body).to.eql({
                        error: "Invalid data provided"
                    });
                    done();
                });
        });

        it('should throw an error if the tokens do not match', (done) => {

            const user = new User({
                email: "user@email.com",
                password: "password",
                resetPasswordToken: "$2b$10$YemzTttRt0npnLK/pUJeWu3EhTpWNrkZyAjbZZBbTjQnUjpaTqviK",
                resetPasswordExpires: Date.now() + (60 * 60 * 1000)
            });

            user.save((err, user) => {
                request(app).post('/api/auth/forgot-password/reset')
                    .send({
                        email: "user@email.com",
                        password: "password",
                        confirm_password: "password",
                        token: "6bc791b1a5bc402c4013e1a49d13098b4a5dd33fs"
                    })
                    .end((err, res) => {
                        expect(res.statusCode).to.equal(404);
                        expect(res.body).to.eql({
                            error: "Invalid data provided"
                        });
                        done();
                    });
            });
        });

        it('should throw an error if the token has expired', (done) => {
            const user = new User({
                email: "user@email.com",
                password: "password",
                resetPasswordToken: "$2b$10$YemzTttRt0npnLK/pUJeWu3EhTpWNrkZyAjbZZBbTjQnUjpaTqviK",
                resetPasswordExpires: Date.now() - (60 * 60 * 1000)
            });

            user.save((err, user) => {
                request(app).post('/api/auth/forgot-password/reset')
                    .send({
                        email: "user@email.com",
                        password: "password",
                        confirm_password: "password",
                        token: "6bc791b1a5bc402c4013e1a49d13098b4a5dd33f"
                    })
                    .end((err, res) => {
                        expect(res.statusCode).to.equal(403);
                        expect(res.body).to.eql({
                            error: "The token is expired"
                        });
                        done();
                    });
            });
        });

        it('should reset the password', (done) => {
            const user = new User({
                email: "user@email.com",
                password: "password",
                resetPasswordToken: "$2b$10$YemzTttRt0npnLK/pUJeWu3EhTpWNrkZyAjbZZBbTjQnUjpaTqviK",
                resetPasswordExpires: Date.now() + (60 * 60 * 1000)
            });

            user.save((err, user) => {
                request(app).post('/api/auth/forgot-password/reset')
                    .send({
                        email: "user@email.com",
                        password: "password",
                        confirm_password: "password",
                        token: "6bc791b1a5bc402c4013e1a49d13098b4a5dd33f"
                    })
                    .end((err, res) => {
                        expect(res.statusCode).to.equal(200);
                        done();
                    });
            });
        });

    });
});