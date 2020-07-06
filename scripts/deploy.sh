#!/bin/bash

if [[ "$1" =~ ^(\-\?|\-h)$ ]]
then
  echo "Usage: `basename $0`"
  exit 1
fi

CLOUDFRONT_DIST_ID=E36XO0IMHMRWCO
HOSTED_ZONE_ID=Z2RNJ4H6FV67LG
DOMAIN=try.alerta.io
S3_HOSTED_ZONE_ID=Z1BKCTXD74EZPE
AWS_DEFAULT_REGION=eu-west-1
export AWS_DEFAULT_REGION

TMP_CONFIG_JSON=/tmp/config.json.$$
TMP_INDEX_HTML=/tmp/index.html.$$
TMP_INPUT_JSON=/tmp/route53-change-resource-record-sets.json.$$

##### BUILD #####

npm run build

##### S3 COPY #####

echo "# Copy to S3: LOCAL -> s3://${DOMAIN} ..."

aws s3 mb s3://${DOMAIN}
aws s3 sync ../dist s3://${DOMAIN} --acl public-read
aws s3 website s3://${DOMAIN} --index-document index.html

##### APP CONFIG #####

echo "# Copy updated config.json to S3: config.json -> s3://${DOMAIN}/config.json ..."

cat >${TMP_CONFIG_JSON} << EOF
{"endpoint": "https://alerta-api.herokuapp.com"}
EOF

aws s3 cp ${TMP_CONFIG_JSON} s3://${DOMAIN}/config.json --acl public-read --content-type application/javascript
rm ${TMP_CONFIG_JSON}

##### CloudFront #####

aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DIST_ID} --paths "/*"

##### Route53 #####

echo "# Alias Record on ROUTE53: http://${DOMAIN} -> http://${DOMAIN}.s3-website-${AWS_DEFAULT_REGION}.amazonaws.com ..."

cat >${TMP_INPUT_JSON} << EOF
{
  "Comment": "Alerta explorer",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "${DOMAIN}",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "${S3_HOSTED_ZONE_ID}",
          "DNSName": "s3-website-${AWS_DEFAULT_REGION}.amazonaws.com.",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}
EOF

aws route53 change-resource-record-sets --hosted-zone-id ${HOSTED_ZONE_ID} --change-batch file://${TMP_INPUT_JSON}
rm ${TMP_INPUT_JSON}

echo "# Done."
