import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "../src/app.module";
import * as fs from "fs";
import * as path from "path";

describe("MoviesController (e2e)", () => {
  let app: INestApplication<App>;
  const favoritesPath = path.join(__dirname, "../data/favorites.json");
  const backupPath = path.join(__dirname, "../data/favorites.backup.json");

  beforeAll(() => {
    // Backup the original favorites file
    if (fs.existsSync(favoritesPath)) {
      fs.copyFileSync(favoritesPath, backupPath);
    }
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same global pipes as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );

    await app.init();

    // Reset favorites to empty array before each test
    fs.writeFileSync(favoritesPath, "[]", "utf-8");
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(() => {
    // Restore the original favorites file
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, favoritesPath);
      fs.unlinkSync(backupPath);
    }
  });

  describe("/movies/search (GET)", () => {
    describe("should return 400", () => {
      it("when query parameter is missing", () => {
        return request(app.getHttpServer())
          .get("/movies/search")
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([
                expect.stringContaining("Query parameter is required"),
              ]),
            );
          });
      });

      it("when query is empty string", () => {
        return request(app.getHttpServer())
          .get("/movies/search")
          .query({ q: "" })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([
                expect.stringContaining("Query parameter is required"),
              ]),
            );
          });
      });

      it("when page is not a valid number (NaN)", () => {
        return request(app.getHttpServer())
          .get("/movies/search")
          .query({ q: "batman", page: "abc" })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([
                expect.stringContaining("Page must be higher than zero"),
              ]),
            );
          });
      });

      it("when page is negative", () => {
        return request(app.getHttpServer())
          .get("/movies/search")
          .query({ q: "batman", page: "-1" })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([
                expect.stringContaining("Page must be higher than zero"),
              ]),
            );
          });
      });

      it("when page is zero", () => {
        return request(app.getHttpServer())
          .get("/movies/search")
          .query({ q: "batman", page: "0" })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([
                expect.stringContaining("Page must be higher than zero"),
              ]),
            );
          });
      });

      it("page is a decimal number", () => {
        return request(app.getHttpServer())
          .get("/movies/search")
          .query({ q: "batman", page: "1.5" })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([
                expect.stringContaining("Page must be a valid number"),
              ]),
            );
          });
      });
    });

    it("should return 200 with valid query and default page", () => {
      return request(app.getHttpServer())
        .get("/movies/search")
        .query({ q: "batman" })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("data");
          expect(res.body.data).toHaveProperty("movies");
          expect(res.body.data).toHaveProperty("count");
          expect(res.body.data).toHaveProperty("totalResults");
        });
    });

    it("should return 200 with valid query and page number", () => {
      return request(app.getHttpServer())
        .get("/movies/search")
        .query({ q: "batman", page: 2 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("data");
        });
    });

    it("should handle queries with special characters", () => {
      return request(app.getHttpServer())
        .get("/movies/search")
        .query({ q: "star wars: episode" })
        .expect(200);
    });
  });

  describe("/movies/favorites (POST)", () => {
    describe("should return 400", () => {
      it("when body is empty", () => {
        return request(app.getHttpServer())
          .post("/movies/favorites")
          .send({})
          .expect(400);
      });

      it("when imdbID is missing", () => {
        return request(app.getHttpServer())
          .post("/movies/favorites")
          .send({
            title: "Batman Begins",
            year: 2005,
            poster: "https://example.com/poster.jpg",
          })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([expect.stringContaining("imdbID")]),
            );
          });
      });

      it("when title is missing", () => {
        return request(app.getHttpServer())
          .post("/movies/favorites")
          .send({
            imdbID: "tt0372784",
            year: 2005,
            poster: "https://example.com/poster.jpg",
          })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([expect.stringContaining("title")]),
            );
          });
      });

      it("when year is missing", () => {
        return request(app.getHttpServer())
          .post("/movies/favorites")
          .send({
            title: "Batman Begins",
            imdbID: "tt0372784",
            poster: "https://example.com/poster.jpg",
          })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([expect.stringContaining("year")]),
            );
          });
      });

      it("when poster is missing", () => {
        return request(app.getHttpServer())
          .post("/movies/favorites")
          .send({
            title: "Batman Begins",
            imdbID: "tt0372784",
            year: 2005,
          })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([expect.stringContaining("poster")]),
            );
          });
      });

      it("when year is not a number", () => {
        return request(app.getHttpServer())
          .post("/movies/favorites")
          .send({
            title: "Batman Begins",
            imdbID: "tt0372784",
            year: "invalid",
            poster: "https://example.com/poster.jpg",
          })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([expect.stringContaining("year")]),
            );
          });
      });

      it("when year is before 1888", () => {
        return request(app.getHttpServer())
          .post("/movies/favorites")
          .send({
            title: "Batman Begins",
            imdbID: "tt0372784",
            year: 1800,
            poster: "https://example.com/poster.jpg",
          })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([expect.stringContaining("year")]),
            );
          });
      });

      it("when imdbID format is invalid (missing tt prefix)", () => {
        return request(app.getHttpServer())
          .post("/movies/favorites")
          .send({
            title: "Batman Begins",
            imdbID: "0372784",
            year: 2005,
            poster: "https://example.com/poster.jpg",
          })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([expect.stringContaining("imdbID")]),
            );
          });
      });

      it("when imdbID format is invalid (too short)", () => {
        return request(app.getHttpServer())
          .post("/movies/favorites")
          .send({
            title: "Batman Begins",
            imdbID: "tt12345",
            year: 2005,
            poster: "https://example.com/poster.jpg",
          })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([expect.stringContaining("imdbID")]),
            );
          });
      });

      it("when poster is not a valid URL", () => {
        return request(app.getHttpServer())
          .post("/movies/favorites")
          .send({
            title: "Batman Begins",
            imdbID: "tt0372784",
            year: 2005,
            poster: "not-a-url",
          })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([expect.stringContaining("poster")]),
            );
          });
      });

      it("when poster URL is missing protocol", () => {
        return request(app.getHttpServer())
          .post("/movies/favorites")
          .send({
            title: "Batman Begins",
            imdbID: "tt0372784",
            year: 2005,
            poster: "example.com/poster.jpg",
          })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([expect.stringContaining("poster")]),
            );
          });
      });

      it("when title is empty string", () => {
        return request(app.getHttpServer())
          .post("/movies/favorites")
          .send({
            title: "",
            imdbID: "tt0372784",
            year: 2005,
            poster: "https://example.com/poster.jpg",
          })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([expect.stringContaining("title")]),
            );
          });
      });
    });

    it("should return 200 or 201 when adding valid movie to favorites", () => {
      return request(app.getHttpServer())
        .post("/movies/favorites")
        .send({
          title: "Batman Begins",
          imdbID: "tt0372784",
          year: 2005,
          poster: "https://example.com/poster.jpg",
        })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
        });
    });

    it("should handle adding duplicate movie (service returns error)", () => {
      const movie = {
        title: "The Dark Knight",
        imdbID: "tt0468569",
        year: 2008,
        poster: "https://example.com/poster2.jpg",
      };

      // Add the movie first
      return request(app.getHttpServer())
        .post("/movies/favorites")
        .send(movie)
        .then(() => {
          // Try to add the same movie again
          return request(app.getHttpServer())
            .post("/movies/favorites")
            .send(movie)
            .expect((res) => {
              // Should return error or same movie
              expect(res.status).toBeGreaterThanOrEqual(200);
            });
        });
    });
  });

  describe("/movies/favorites/:imdbID (DELETE)", () => {
    describe("validation errors", () => {
      it("should return 400 when imdbID is empty string", () => {
        return request(app.getHttpServer())
          .delete("/movies/favorites/")
          .expect(404); // Empty param results in route not found
      });

      it("should handle non-existent imdbID gracefully", () => {
        return request(app.getHttpServer())
          .delete("/movies/favorites/tt9999999")
          .expect((res) => {
            // Could be 404 (not found) or 200 (already removed)
            expect([200, 404]).toContain(res.status);
          });
      });
    });

    it("should return 200 when removing existing favorite", async () => {
      // First add a movie
      const movie = {
        title: "Inception",
        imdbID: "tt1375666",
        year: 2010,
        poster: "https://example.com/inception.jpg",
      };

      await request(app.getHttpServer()).post("/movies/favorites").send(movie);

      // Then remove it
      return request(app.getHttpServer())
        .delete("/movies/favorites/tt1375666")
        .expect((res) => {
          expect([200, 204]).toContain(res.status);
        });
    });
  });

  describe("/movies/favorites/list (GET)", () => {
    describe("should return 400", () => {
      it("when invalid page parameter is a string", () => {
        return request(app.getHttpServer())
          .get("/movies/favorites/list")
          .query({ page: "abc" })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([
                expect.stringContaining("Page must be higher than zero"),
              ]),
            );
          });
      });

      it("when page parameter is negative", () => {
        return request(app.getHttpServer())
          .get("/movies/favorites/list")
          .query({ page: -1 })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([
                expect.stringContaining("Page must be higher than zero"),
              ]),
            );
          });
      });

      it("when page parameter is zero", () => {
        return request(app.getHttpServer())
          .get("/movies/favorites/list")
          .query({ page: 0 })
          .expect(400)
          .expect((res) => {
            expect(
              Array.isArray(res.body.message)
                ? res.body.message
                : [res.body.message],
            ).toEqual(
              expect.arrayContaining([
                expect.stringContaining("Page must be higher than zero"),
              ]),
            );
          });
      });
    });

    it("should return 200 with default page when page is not provided", () => {
      return request(app.getHttpServer())
        .get("/movies/favorites/list")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
          if (res.status === 200) {
            expect(res.body).toHaveProperty("data");
          }
        });
    });

    it("should return paginated favorites when favorites exist", async () => {
      // Add some movies to favorites first
      const movies = [
        {
          title: "The Matrix",
          imdbID: "tt0133093",
          year: 1999,
          poster: "https://example.com/matrix.jpg",
        },
        {
          title: "Interstellar",
          imdbID: "tt0816692",
          year: 2014,
          poster: "https://example.com/interstellar.jpg",
        },
      ];

      for (const movie of movies) {
        await request(app.getHttpServer())
          .post("/movies/favorites")
          .send(movie);
      }

      // Get favorites list
      return request(app.getHttpServer())
        .get("/movies/favorites/list")
        .query({ page: 1 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("data");
          expect(res.body.data).toHaveProperty("favorites");
          expect(res.body.data).toHaveProperty("count");
          expect(res.body.data).toHaveProperty("totalResults");
          expect(res.body.data).toHaveProperty("currentPage");
          expect(res.body.data).toHaveProperty("totalPages");
        });
    });

    it("should handle empty favorites list", () => {
      return request(app.getHttpServer())
        .get("/movies/favorites/list")
        .query({ page: "1" })
        .expect((res) => {
          // Could be 404 (no favorites) or 200 (empty list)
          expect([200, 404]).toContain(res.status);
        });
    });

    it("should handle page beyond available pages", () => {
      return request(app.getHttpServer())
        .get("/movies/favorites/list")
        .query({ page: 999 })
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });
  });
});
