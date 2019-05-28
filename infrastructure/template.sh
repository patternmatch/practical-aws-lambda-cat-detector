#!/bin/bash

N=$1

PREVIOUS=`printf "%03d" $((N - 1))`
ACTUAL=`printf "%03d" $N`

cat <<EOF
  User${ACTUAL}:
    Type: AWS::IAM::User
    Properties:
      UserName: serverless-cat-detector-user${ACTUAL}
      LoginProfile:
        Password: !Ref PASSWORD
        PasswordResetRequired: true
      Groups:
        - !Ref ParticipantGroup

EOF