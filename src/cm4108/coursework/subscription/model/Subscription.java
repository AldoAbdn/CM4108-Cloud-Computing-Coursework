package cm4108.coursework.subscription.model;

import com.amazonaws.services.dynamodbv2.datamodeling.*;

import cm4108.coursework.config.*;

@DynamoDBTable(tableName=SubscriptionConfig.DYNAMODB_TABLE_NAME)
public class Subscription {
	private String subscriberID;
	private String subscriptionID;

	public Subscription() {
		
	}
	
	public Subscription(String subscriberID,String subscriptionID) {
		this.setSubscriberID(subscriberID);
		this.setSubscriptionID(subscriptionID);
	}
	
	@DynamoDBHashKey(attributeName="subscriberID")
	public String getSubscriberID() {
		return subscriberID;
	}

	public void setSubscriberID(String subscriberID) {
		this.subscriberID = subscriberID;
	}

	@DynamoDBRangeKey(attributeName="subscriptionID")
	public String getSubscriptionID() {
		return subscriptionID;
	}

	public void setSubscriptionID(String subscriptionID) {
		this.subscriptionID = subscriptionID;
	}	
}
