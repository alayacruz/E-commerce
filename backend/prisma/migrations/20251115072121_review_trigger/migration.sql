-- This is an empty migration.
--Adding trigger that fires when a new review is entered and changes avgRating of product

CREATE OR REPLACE FUNCTION update_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Product"
    SET "avgRating" = (
        SELECT AVG("rating")
        FROM "Review"
        WHERE "productId" = NEW."productId"
    )
    WHERE "productId" = NEW."productId";

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS avg_rating_trigger ON "Review";

CREATE TRIGGER avg_rating_trigger
AFTER INSERT ON "Review"
FOR EACH ROW
EXECUTE FUNCTION update_avg_rating();