package cm4108.coursework.location.model;

import com.amazonaws.services.dynamodbv2.datamodeling.*;
import cm4108.coursework.config.*;

@DynamoDBTable(tableName = LocationConfig.DYNAMODB_TABLE_NAME)
public class Location {
	private String id;
	private double longitude,latitude;
	
	public Location() {
		
	}
	
	public Location (String id,double longitude,double latitude) {
		this.setId(id);
		this.setLongitude(longitude);
		this.setLatitude(latitude);
	}
	
	@DynamoDBHashKey(attributeName="id")
	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id = id;
	}

	@DynamoDBAttribute(attributeName="longitude")
	public double getLongitude() {
		return longitude;
	} 

	public void setLongitude(double longitude) {
		this.longitude = longitude;
	} 

	@DynamoDBAttribute(attributeName="latitude")
	public double getLatitude() {
		return latitude;
	} 

	public void setLatitude(double latitude) {
		this.latitude = latitude;
	} 
}
