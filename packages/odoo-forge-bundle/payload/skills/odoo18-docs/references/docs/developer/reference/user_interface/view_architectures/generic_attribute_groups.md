---
title: "The comma-separated list of user groups to whom the element is displayed. Users who do not belong"
source_url: "https://docs.odoo.sbggai.top/developer/reference/user_interface/view_architectures/generic_attribute_groups.html"
---

.. attribute:: groups
   :noindex:

   The comma-separated list of user groups to whom the element is displayed. Users who do not belong
   to at least one of these groups are unable to see the element. Groups can be prefixed with the
   negative `!` operator to exclude them.

   .. example::

      ```xml

         <field name="FIELD_NAME" groups="base.group_no_one,!base.group_multi_company"/>

   :requirement: Optional
   :type: str
   :default: `''`
