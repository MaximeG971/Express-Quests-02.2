const request = require("supertest");
const crypto = require("node:crypto");
const database = require("../database");

const app = require("../src/app");

describe("GET /api/users", () => {
  it("should return all users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });
});

describe("GET /api/users/:id", () => {
  it("should return one user", async () => {
    const response = await request(app).get("/api/users/1");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });

  it("should return no user", async () => {
    const response = await request(app).get("/api/users/0");

    expect(response.status).toEqual(404);
  });
});

describe("POST /api/users", () => {
  it("should return created user", async () => {
    const newUser = {
      firstname: "Marie",
      lastname: "Martin",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Paris",
      language: "French",
    };

    const response = await request(app).post("/api/users").send(newUser);

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("number");

    const getResponse = await request(app).get(
      `/api/users/${response.body.id}`
    );

    expect(getResponse.headers["content-type"]).toMatch(/json/);
    expect(getResponse.status).toEqual(200);

    expect(getResponse.body).toHaveProperty("id");

    expect(getResponse.body).toHaveProperty("firstname");
    expect(getResponse.body.firstname).toStrictEqual(newUser.firstname);

    expect(getResponse.body).toHaveProperty("lastname");
    expect(getResponse.body.lastname).toStrictEqual(newUser.lastname);

    expect(getResponse.body).toHaveProperty("email");
    expect(getResponse.body.email).toStrictEqual(newUser.email);

    expect(getResponse.body).toHaveProperty("city");
    expect(getResponse.body.city).toStrictEqual(newUser.city);

    expect(getResponse.body).toHaveProperty("language");
    expect(getResponse.body.language).toStrictEqual(newUser.language);
  });

  it("should return an error", async () => {
    const userWithMissingProps = { firstname: "Eric" };

    const response = await request(app)
      .post("/api/users")
      .send(userWithMissingProps);

    expect(response.status).toEqual(422);
  });
});

describe("PUT /api/users/:id", () => {
  it("should edit user", async () => {
    const newUser = {
      firstname: "James",
      lastname: "Cameron",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Los Angeles",
      language: "English",
    };
    const [resultSelect] = await database.query(
      "INSERT INTO users(firstname, lastname, email, city, languaeg) VALUES (?, ?, ?, ?, ?)",
      [
        newUser.firstname,
        newUser.lastname,
        newUser.email,
        newUser.city,
        newUser.language,
      ]
    );

    const id = result.insertId;

    const updatedUser = {
      firstname: "Alan",
      lastname: "Smithee",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "London",
      language: "English",
    };

    const response = await request(app)
      .put(`/api/users/${id}`)
      .send(updatedUser);

    expect(response.status).toEqual(204);
    const [result] = await database.query("SELECT * FROM users WHERE id=?", id);

    const [userInDatabase] = resultSelect;

    expect(userInDatabase).toHaveProperty("id");

    expect(userInDatabase).toHaveProperty("firstname");
    expect(userInDatabase.firstname).toStrictEqual(updatedUser.firstname);

    expect(userInDatabase).toHaveProperty("lastname");
    expect(userInDatabase.lastname).toStrictEqual(updatedUser.lastname);

    expect(userInDatabase).toHaveProperty("email");
    expect(userInDatabase.emailr).toStrictEqual(updatedUser.email);

    expect(userInDatabase).toHaveProperty("city");
    expect(Boolean(userInDatabase.city)).toStrictEqual(updatedUser.city);

    expect(userInDatabase).toHaveProperty("language");
    expect(userInDatabase.language).toStrictEqual(updatedUser.language);
  });

  it("should return an error", async () => {
    const userWithMissingProps = { firstname: "Cristiano" };

    const response = await request(app)
      .put(`/api/users/1`)
      .send(movieWithMissingProps);

    expect(response.status).toEqual(422);
  });
  it("should return no user", async () => {
    const newMovie = {
      firstname: "Eric",
      lastname: "Cameron",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Los Angeles",
      language: "English",
    };

    const response = await request(app).put("/api/users/0").send(newUser);

    expect(response.status).toEqual(404);
  });
});

describe("DELETE /api/users/:id", () => {
  it("should delete one user", async () => {
    const response = await request(app).delete("/api/users/1");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(201);
  });

  it("should delete no user", async () => {
    const response = await request(app).delete("/api/users/0");

    expect(response.status).toEqual(404);
  });
});
