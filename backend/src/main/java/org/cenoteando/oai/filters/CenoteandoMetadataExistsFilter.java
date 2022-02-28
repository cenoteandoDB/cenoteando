package org.cenoteando.oai.filters;

import com.lyncode.xoai.dataprovider.xml.xoaiconfig.parameters.ParameterValue;
import com.lyncode.xoai.dataprovider.xml.xoaiconfig.parameters.SimpleType;
import java.util.ArrayList;
import java.util.List;
import org.cenoteando.oai.model.CenoteandoItem;

public class CenoteandoMetadataExistsFilter extends CenoteandoFilter {

  private List<String> fields;

  private List<String> getFields() {
    if (this.fields == null) {
      ParameterValue<?> fields = getConfiguration().get("fields");
      if (fields == null) fields = getConfiguration().get("field");

      if (fields instanceof SimpleType) {
        this.fields = new ArrayList<>();
        this.fields.add(((SimpleType<?>) fields).asString());
      } else {
        this.fields = new ArrayList<>();
        for (ParameterValue<?> val : fields
          .asParameterList()
          .getValues()) this.fields.add(val.asSimpleType().asString());
      }
    }
    return fields;
  }

  @Override
  public boolean isShown(CenoteandoItem item) {
    return true;
    /* TODO: Implement this
        for (String field : this.getFields()) {
            //do we have a match? if yes, our job is done
            if (item.getMetadata(field).size() > 0)
                return true;
        }
        return false;
        */
  }

  @Override
  public String getQuery() {
    // TODO: Implement this?
    return null;
  }
}
