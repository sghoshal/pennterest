SELECT firstname, lastname FROM Users WHERE userid in (
    SELECT DISTINCT userid FROM Following WHERE boardid IN (
        SELECT boardid FROM Board WHERE userid=101
    )
);
