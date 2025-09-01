CREATE TABLE Products (
    Id VARCHAR(10) PRIMARY KEY,
        Type VARCHAR(50) NOT NULL,
        Name VARCHAR(100) NOT NULL,
        Version VARCHAR(50)
        );

INSERT INTO Products (Id, Type, Name, Version) VALUES ('09', 'CREDIT_CARD', 'Gem Visa', 'v1');
INSERT INTO Products (Id, Type, Name, Version) VALUES ('10', 'CREDIT_CARD', '28 Degrees', 'v1');
INSERT INTO Products (Id, Type, Name, Version) VALUES ('11', 'PERSONAL_LOAN', 'MyFlexiPay', 'v2');