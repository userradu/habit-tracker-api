const expect = require('chai').expect;
const request = require('supertest');
const utils = require('../server/utils/utils');
const User = require('../server/api/user/userModel');

const app = require('../server/server');

describe('User', () => {

    beforeEach((done) => {
        utils.clearDatabase(done);
    });

    describe('Check if email is not taken', () => {

        it('should throw an error if the email is not supplied', (done) => {
            request(app).post('/api/users/checkEmailNotTaken')
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
            request(app).post('/api/users/checkEmailNotTaken')
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


        it('should return false', (done) => {
            request(app).post('/api/users/checkEmailNotTaken')
                .send({
                    email: "user@email.com"
                })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body).to.have.property('emailTaken');
                    expect(res.body.emailTaken).to.be.false;
                    done();
                });
        });

        it('should return true', (done) => {
            const email = "user@email.com";

            const user = new User({
                email: email,
                password: "password"
            });

            return user.save((err, user) => {
                request(app).post('/api/users/checkEmailNotTaken')
                    .send({
                        email: "user@email.com"
                    })
                    .end((err, res) => {
                        expect(res.statusCode).to.equal(200);
                        expect(res.body).to.have.property('emailTaken');
                        expect(res.body.emailTaken).to.be.true;
                        done();
                    });
            });
        });

    });

});