# Import system modules
import arcpy

def main():
    try:
        # Get parameters from the tool interface
        inputFC = arcpy.GetParameterAsText(0)  # Input feature class
        inputString = arcpy.GetParameterAsText(1)  # Field names
        fieldType = arcpy.GetParameterAsText(2)  # Field type
        fieldLength = arcpy.GetParameterAsText(3)  # Field length
        
        # Validate input feature class exists
        if not arcpy.Exists(inputFC):
            arcpy.AddError(f"Input feature class does not exist: {inputFC}")
            return
        
        # Convert field names to list and clean them
        fieldList = [name.strip() for name in inputString.split(";") if name.strip()]
        
        if not fieldList:
            arcpy.AddError("No valid field names provided.")
            return
        
        # Process field length parameter
        field_length_int = 50  # Default value
        
        if fieldType.upper() == "TEXT":
            if fieldLength and fieldLength != "#":
                try:
                    field_length_int = int(fieldLength)
                    if field_length_int <= 0:
                        arcpy.AddWarning("Field length must be positive. Using default value of 50.")
                        field_length_int = 50
                    elif field_length_int > 255:
                        arcpy.AddWarning("Field length exceeds maximum of 255. Using 255.")
                        field_length_int = 255
                except ValueError:
                    arcpy.AddWarning(f"Invalid field length '{fieldLength}'. Using default value of 50.")
                    field_length_int = 50
            
            arcpy.AddMessage(f"Creating TEXT fields with length: {field_length_int}")
        
        # Create fields
        created_count = 0
        for name in fieldList:
            try:
                if fieldType.upper() == "TEXT":
                    arcpy.AddField_management(inputFC, name, fieldType, field_length=field_length_int)
                    arcpy.AddMessage(f"✅ Text field created: {name} (Length: {field_length_int})")
                else:
                    arcpy.AddField_management(inputFC, name, fieldType)
                    arcpy.AddMessage(f"✅ Field created: {name} (Type: {fieldType})")
                created_count += 1
            except arcpy.ExecuteError:
                arcpy.AddWarning(f"Could not create field '{name}'. It may already exist.")
            except Exception as e:
                arcpy.AddWarning(f"Error creating field '{name}': {str(e)}")
        
        # Final summary
        arcpy.AddMessage(f"✅ Successfully created {created_count} out of {len(fieldList)} fields.")
        
    except Exception as e:
        arcpy.AddError(f"Script execution failed: {str(e)}")

if __name__ == "__main__":
    main()