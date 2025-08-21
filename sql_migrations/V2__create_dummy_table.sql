CREATE TABLE DummyData (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Age INT,
    City VARCHAR(100)
);

INSERT INTO DummyData (Name, Age, City) VALUES ('Alice', 30, 'New York');
INSERT INTO DummyData (Name, Age, City) VALUES ('Bob', 25, 'Los Angeles');
INSERT INTO DummyData (Name, Age, City) VALUES ('Charlie', 35, 'Chicago');