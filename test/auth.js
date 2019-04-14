const expect = require('chai').expect;
const request = require('supertest');

const app = require('../server/server');

describe('Signup', () => {
    it('should create an account', (done) => {
        request(app).post('/auth/signup')
            .send({
                email: "userradu91@gmail.com",
                password: "password",
                confirm_password: "password"
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(201);
                done();
            })
    });
});