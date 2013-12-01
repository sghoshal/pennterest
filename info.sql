SELECT U.firstname, U.lastname, U.profile_pic, U.cover_pic, COUNT(B.boardid), COUNT(photoid)
FROM ((Users U INNER JOIN Board B ON U.userid=B.userid) INNER JOIN Pin P ON  B.boardid=P.boardid) WHERE U.userid IN (SELECT DISTINCT F.userid
    FROM Following F
    WHERE F.boardid IN (SELECT B1.boardid
         FROM BOARD B1
         WHERE B.userid=101))
GROUP BY (U.firstname, U.lastname, U.profile_pic, U.cover_pic, U.userid);

