package cm4108.coursework.request.model;

import com.amazonaws.services.dynamodbv2.datamodeling.*;

import cm4108.coursework.config.*;

@DynamoDBTable(tableName=RequestConfig.DYNAMODB_TABLE_NAME)
public class Request {
	private String recipientID;
	private String requesterID;

	public Request(){
		
	}
	
	public Request(String requesterID, String recipientID){
		this.setRequesterID(requesterID);
		this.setRecipientID(recipientID);
	}

	@DynamoDBHashKey(attributeName="recipientID")
	public String getRecipientID() {
		return recipientID;
	}

	public void setRecipientID(String recipientID) {
		this.recipientID = recipientID;
	}
	
	@DynamoDBRangeKey(attributeName="requesterID")
	public String getRequesterID() {
		return requesterID;
	}

	public void setRequesterID(String requesterID) {
		this.requesterID = requesterID;
	}
}
