package org.cenoteando.oai.model;

import com.lyncode.xoai.builders.dataprovider.ElementBuilder;
import com.lyncode.xoai.builders.dataprovider.MetadataBuilder;
import com.lyncode.xoai.dataprovider.core.ItemMetadata;
import com.lyncode.xoai.dataprovider.core.ReferenceSet;
import com.lyncode.xoai.dataprovider.data.About;
import com.lyncode.xoai.dataprovider.data.Item;
import com.lyncode.xoai.dataprovider.services.api.DateProvider;
import com.lyncode.xoai.dataprovider.services.impl.BaseDateProvider;
import com.lyncode.xoai.dataprovider.xml.xoai.Element;
import com.lyncode.xoai.dataprovider.xml.xoai.Metadata;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.regex.Pattern;
import org.apache.commons.lang3.StringUtils;
import org.cenoteando.models.Cenote;

public class CenoteandoItem implements Item {

  private final Cenote cenote;
  private final List<ReferenceSet> sets;

  private static final String PREFIX = "cenoteando.org";
  private static DateProvider formatter = new BaseDateProvider();

  public CenoteandoItem(Cenote cenote) {
    this.cenote = cenote;
    sets = Collections.singletonList(new ReferenceSet("openaire_data"));
  }

  /**
   * Most of the implementations would return an empty list.
   * Anyway, the OAI-PMH protocol establishes an about section for each item.
   *
   * @return List of information about the item (marshable information)
   */
  @Override
  public List<About> getAbout() {
    return new ArrayList<>();
  }

  /**
   * Metadata associated to the OAI-PMH Record.
   *
   * @return Metadata associated to the OAI-PMH Record
   */
  @Override
  public ItemMetadata getMetadata() {
    List<Element> contributors = getContributors()
      .stream()
      .map(contributor ->
        new ElementBuilder()
          .withName(contributor.getType())
          .withField("person.identifier.rnctimx", contributor.getId())
          .withField("dc.contributor", contributor.getName())
          .build()
      )
      .toList();

    Metadata metadata = new MetadataBuilder()
      .withElement(
        new ElementBuilder()
          .withName("dc")
          .withSubElements(
            new ElementBuilder()
              .withName("title")
              .withSubElements(
                new ElementBuilder().withField("value", cenote.getName()).build()
              )
              .build(),
            new ElementBuilder()
              .withName("contributor")
              .withSubElements(contributors.toArray(new Element[0]))
              .build(),
            new ElementBuilder()
              .withName("date")
              .withSubElements(
                new ElementBuilder()
                  .withName("created")
                  .withSubElements(
                    new ElementBuilder()
                      .withField("value", formatter.format(cenote.getCreatedAt()))
                      .build()
                  )
                  .build(),
                new ElementBuilder()
                  .withName("updated")
                  .withSubElements(
                    new ElementBuilder()
                      .withField("value", formatter.format(cenote.getUpdatedAt()))
                      .build()
                  )
                  .build()
              )
              .build(),
            new ElementBuilder()
              .withName("publisher")
              .withSubElements(
                new ElementBuilder()
                  // TODO: Get from config
                  .withField(
                    "value",
                    "Cenoteando, Facultad de Ciencias, UNAM (cenoteando.mx)"
                  )
                  .build()
              )
              .build(),
            new ElementBuilder()
              .withName("type")
              .withSubElements(
                new ElementBuilder().withField("value", "Ficha informativa").build()
              )
              .build(),
            new ElementBuilder()
              .withName("description")
              .withSubElements(
                new ElementBuilder()
                  .withName("abstract")
                  .withSubElements(
                    new ElementBuilder()
                      // TODO: Get from config
                      .withField(
                        "value",
                        "Registro de informacion general multidisciplinaria de cenotes de la peninsula de yucatan, proveniente de la base de datos de cenoteando.mx"
                      )
                      .build()
                  )
                  .build()
              )
              .build(),
            new ElementBuilder()
              .withName("identifier")
              .withSubElements(
                new ElementBuilder()
                  .withName("uri")
                  .withSubElements(
                    new ElementBuilder().withField("value", getIdentifier()).build()
                  )
                  .build()
              )
              .build(),
            new ElementBuilder()
              .withName("subject")
              .withSubElements(
                // TODO: Create enum with subjects and use that instead
                new ElementBuilder().withField("value", "1").build(),
                new ElementBuilder().withField("value", "2").build(),
                new ElementBuilder().withField("value", "5").build()
              )
              .build(),
            new ElementBuilder()
              .withName("geoLocations")
              // TODO: Implement geoLocations
              .build()
          )
          .build(),
        new ElementBuilder()
          .withName("bundles")
          .withSubElements(
            new ElementBuilder()
              .withName("bundle")
              .withField("name", "ORIGINAL")
              .withSubElements(
                new ElementBuilder()
                  .withName("bitstreams")
                  .withSubElements(
                    new ElementBuilder()
                      .withName("bitstream")
                      // TODO: Get dynamically
                      .withField("format", "JSON")
                      .withField("format", "CSV")
                      .withField("size", "474")
                      .build()
                  )
                  .build()
              )
              .build()
          )
          .build()
      )
      .build();
    return new ItemMetadata(metadata);
  }

  /**
   * Returns the OAI-PMH unique identifier.
   *
   * @return OAI-PMH unique identifier.
   */
  @Override
  public String getIdentifier() {
    return buildIdentifier(getEntityType(), getHandle());
  }

  /**
   * Creation, modification or deletion date.
   *
   * @return OAI-PMH record datestamp
   */
  @Override
  public Date getDatestamp() {
    return cenote.getCreatedAt();
  }

  /**
   * Exposes the list of sets (using the set_spec) that contains the item (OAI-PMH record).
   *
   * @return List of sets
   */
  @Override
  public List<ReferenceSet> getSets() {
    return sets;
  }

  /**
   * Checks if the item is deleted or not.
   *
   * @return Checks if the item is deleted or not.
   */
  @Override
  public boolean isDeleted() {
    return false;
  }

  public boolean isPublic() {
    return cenote.isTouristic();
  }

  public String getEntityType() {
    return cenote.getArangoId().split("/")[0];
  }

  public String getHandle() {
    return cenote.getId();
  }

  public static String buildIdentifier(String entityType, String handle) {
    String result = "";
    if (StringUtils.isNotBlank(entityType)) {
      result = "oai:" + PREFIX + ":" + entityType + "/" + handle;
    } else {
      result = "oai:" + PREFIX + ":" + handle;
    }
    return result;
  }

  public static String parseHandle(String oaiIdentifier) {
    String[] parts = oaiIdentifier.split(Pattern.quote(":"));
    return parts[parts.length - 1];
  }

  // TODO: Get from database
  private List<CenoteandoContributor> getContributors() {
    List<CenoteandoContributor> contributors = new ArrayList<>();
    contributors.add(
      new CenoteandoContributor(
        "Author",
        "Fernando Nuno Dias Marques Simoes",
        "info:eu-repo/dai/mx/cvu/208814"
      )
    );
    contributors.add(
      new CenoteandoContributor(
        "DataCollector",
        "Luis Arturo Liévano-Beltrán",
        "info:eu-repo/dai/mx/orcid/0000-0003-0073-9203"
      )
    );
    contributors.add(
      new CenoteandoContributor(
        "DataCollector",
        "Efrain Miguel Chavez Solis",
        "info:eu-repo/dai/mx/orcid/0000-0001-9423-9335"
      )
    );
    contributors.add(
      new CenoteandoContributor(
        "DataCollector",
        "Dorottya Angyal",
        "info:eu-repo/dai/mx/orcid/0000-0002-2380-2482"
      )
    );
    contributors.add(
      new CenoteandoContributor(
        "DataCollector",
        "Nori Velazquez Juarez",
        "info:eu-repo/dai/mx/curp/VEJN950421MDFLRR05"
      )
    );
    contributors.add(
      new CenoteandoContributor(
        "DataCurator",
        "Ricardo Merlos Riestra",
        "info:eu-repo/dai/mx/curp/MERR880417HDFRSC06"
      )
    );
    contributors.add(
      new CenoteandoContributor(
        "DataManager",
        "Isaac Chacon Gomez",
        "info:eu-repo/dai/mx/curp/CAGI831107HDFHMS04"
      )
    );
    contributors.add(
      new CenoteandoContributor(
        "ProjectMember",
        "Diogo Seca Repas Gonçalves",
        "info:eu-repo/dai/mx/orcid/0000-0003-4983-0032"
      )
    );
    contributors.add(
      new CenoteandoContributor(
        "ProjectMember",
        "Luis Angel Yerbes Rodriguez",
        "info:eu-repo/dai/mx/curp/YERL961125HYNRDS09"
      )
    );
    contributors.add(
      new CenoteandoContributor(
        "ProjectMember",
        "Charly Joan Llanes Euan",
        "info:eu-repo/dai/mx/curp/LAEC930819HYNLNH07"
      )
    );
    contributors.add(
      new CenoteandoContributor(
        "Researcher",
        "Maite Mascaro",
        "info:eu-repo/dai/mx/orcid/0000-0003-3614-4383"
      )
    );
    return contributors;
  }
}
