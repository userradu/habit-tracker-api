const expect = require('chai').expect;
const request = require('supertest');
const utils = require('../server/utils/utils');
const User = require('../server/api/user/userModel');
const Habit = require('../server/api/habit/habitModel');
const jwt = require('jsonwebtoken');
const config = require('../server/config/config');
const mongoose = require('mongoose');

const app = require('../server/server');

describe("Habits", () => {

    const userDetails = {
        email: "user@email.com",
        password: "password"
    }

    let token = null;
    let userId = null;

    before((done) => {
        utils.clearDatabase(() => {
            utils.generateHash("password")
                .then((hash) => {
                    const user = new User({
                        email: userDetails.email,
                        password: hash,
                        verified: true
                    });
                    return user.save();
                })
                .then(() => {
                    request(app)
                        .post('/api/auth/login')
                        .send(userDetails)
                        .end((err, res) => {
                            token = res.body.data.token;
                            decoded = jwt.verify(token, config.jwt_secret);
                            userId = decoded._id;
                            done();
                        })
                })
        });
    });

    beforeEach((done) => {
        Habit.deleteMany({}, () => {
            done();
        });
    })

    it('should get all the habits', (done) => {
        request(app)
            .get('/api/habits')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.have.property('status');
                expect(res.body.status).to.equal('success');
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.have.property('habits');
                expect(res.body.data.habits).to.be.an('array');
                done();
            });
    });

    it('should throw an error if the name field is missing when creating a habit', (done) => {
        request(app)
            .post('/api/habits')
            .set('Authorization', `Bearer ${token}`)
            .send({})
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.eql({
                    status: 'fail',
                    data: {
                        errors: ['The habit name is required']
                    }
                });
                done();
            });
    });

    it('should create a habit', (done) => {
        request(app)
            .post('/api/habits')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'habit'
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(201);
                expect(res.body).to.have.property('status');
                expect(res.body.status).to.equal('success');
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.have.property('habit');
                done();
            });
    });

    it("should return 404 when trying to get a habit which doesn't exists", (done) => {
        const id = mongoose.Types.ObjectId();
        request(app)
            .get(`/api/habits/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.statusCode).to.equal(404);
                expect(res.body).to.eql({
                    status: 'fail',
                    data: {
                        errors: ['The habit does not exist']
                    }
                });
                done();
            });
    });

    it('should get a habit by an id', (done) => {
        const habit = new Habit({
            name: 'habit',
            user: userId
        });

        habit.save(() => {
            request(app)
                .get(`/api/habits/${habit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body).to.have.property('status');
                    expect(res.body.status).to.equal('success');
                    expect(res.body).to.have.property('data');
                    expect(res.body.data).to.have.property('habit');
                    expect(habit._id.equals(res.body.data.habit._id)).to.be.true;
                    done();
                });
        });
    });

    it("should return 404 when trying to update a habit which doesn't exits", (done) => {
        const id = mongoose.Types.ObjectId();
        request(app)
            .put(`/api/habits/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'habit'
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(404);
                expect(res.body).to.eql({
                    status: 'fail',
                    data: {
                        errors: ['The habit does not exist']
                    }
                });
                done();
            });
    });

    it("should throw an error if the name is missing when trying to update", (done) => {
        const habit = new Habit({
            name: 'habit',
            user: userId
        });

        habit.save(() => {
            request(app)
                .put(`/api/habits/${habit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({})
                .end((err, res) => {
                    expect(res.statusCode).to.equal(400);
                    expect(res.body).to.eql({
                        status: 'fail',
                        data: {
                            errors: ['The habit name is required']
                        }
                    });
                    done();
                });
        });
    });

    it("should update a habit", (done) => {
        const habit = new Habit({
            name: 'habit',
            user: userId
        });

        habit.save(() => {
            request(app)
                .put(`/api/habits/${habit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'habitNameModified'
                })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body).to.have.property('status');
                    expect(res.body.status).to.equal('success');
                    expect(res.body).to.have.property('data');
                    expect(res.body.data).to.have.property('habit');
                    expect(res.body.data.habit.name).to.equal("habitNameModified");
                    done();
                });
        });
    });

    it("should return 404 when trying to delete a habit which doesn't exits", (done) => {
        const id = mongoose.Types.ObjectId();
        request(app)
            .delete(`/api/habits/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.statusCode).to.equal(404);
                expect(res.body).to.eql({
                    status: 'fail',
                    data: {
                        errors: ['The habit does not exist']
                    }
                });
                done();
            });
    });

    it("should delete a habit", (done) => {
        const habit = new Habit({
            name: 'habit',
            user: userId
        });

        habit.save(() => {
            request(app)
                .delete(`/api/habits/${habit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body).to.have.property('status');
                    expect(res.body.status).to.equal('success');
                    expect(res.body).to.have.property('message');
                    expect(res.body.message).to.equal("The habit was deleted");
                    done();
                });
        });
    });

});